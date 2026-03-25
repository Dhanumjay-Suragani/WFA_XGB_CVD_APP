from pathlib import Path
import re
import shutil

import joblib
import numpy as np
import pandas as pd
import pytesseract
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random
from datetime import datetime, timezone
from urllib.parse import quote_plus
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
from werkzeug.utils import secure_filename



# ------------------ CONFIG ------------------
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")}})

@app.route("/healthz")
def health():
    return {"status": "ok"}, 200

def build_mongo_uri():
    """Use MONGO_URI, or build from MONGO_USER + MONGO_PASSWORD + MONGO_CLUSTER_HOST (password auto-encoded)."""
    uri = (os.getenv("MONGO_URI") or "").strip()
    if uri:
        return uri
    user = (os.getenv("MONGO_USER") or "").strip()
    password = (os.getenv("MONGO_PASSWORD") or "").strip()
    host = (os.getenv("MONGO_CLUSTER_HOST") or "").strip()
    if user and password and host:
        safe_user = quote_plus(user)
        safe_pw = quote_plus(password)
        return (
            f"mongodb+srv://{safe_user}:{safe_pw}@{host}/"
            "?retryWrites=true&w=majority"
        )
    return None


# 🔗 MongoDB Atlas
MONGO_URI = build_mongo_uri()
DB_NAME = os.getenv("MONGO_DB_NAME", "heartdb")
client = None
db = None
patients_col = None
users_col = None
otp_col = None
db_error = None

if not MONGO_URI:
    print("⚠️ MongoDB not configured")
else:
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        db = client[DB_NAME]
        patients_col = db["patients"]
        users_col = db["users"]
        otp_col = db["otp"]
    except Exception as exc:
        db_error = f"MongoDB connection failed: {exc}"

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def resolve_tesseract_executable():
    """Resolve Tesseract binary: TESSERACT_CMD, PATH, then common Windows install paths."""
    env_path = (os.getenv("TESSERACT_CMD") or "").strip()
    if env_path and os.path.isfile(env_path):
        return env_path
    w = shutil.which("tesseract")
    if w and os.path.isfile(w):
        return w
    for candidate in (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ):
        if os.path.isfile(candidate):
            return candidate
    return None


# 🔤 Tesseract OCR (optional — used when a report image is uploaded)
_TESSERACT_EXE = resolve_tesseract_executable()
if _TESSERACT_EXE:
    pytesseract.pytesseract.tesseract_cmd = _TESSERACT_EXE

_env_tess = (os.getenv("TESSDATA_PREFIX") or "").strip()
if _env_tess and os.path.isdir(_env_tess):
    os.environ["TESSDATA_PREFIX"] = _env_tess
elif _TESSERACT_EXE:
    _td = Path(_TESSERACT_EXE).resolve().parent / "tessdata"
    if _td.is_dir():
        os.environ["TESSDATA_PREFIX"] = str(_td)


def extract_bp_chol_from_ocr(text):
    """Best-effort BP and cholesterol from OCR text (same patterns as before)."""
    bp = chol = None
    bp_match = re.search(r"(BP|Blood Pressure)[^\d]*(\d+)", text, re.IGNORECASE)
    chol_match = re.search(r"(Cholesterol)[^\d]*(\d+)", text, re.IGNORECASE)
    if bp_match:
        bp = int(bp_match.group(2))
    if chol_match:
        chol = int(chol_match.group(2))
    return bp, chol


# ------------------ ML MODEL (full_pipeline.pkl — do not modify artifact) ------------------
MODEL_PATH = Path(__file__).resolve().parent / "models" / "full_pipeline.pkl"
ml_bundle = None
FEATURE_ORDER = None
DEFAULT_FEATURES = {}
ml_load_error = None

try:
    if MODEL_PATH.is_file():
        ml_bundle = joblib.load(MODEL_PATH)
        _scaler = ml_bundle.get("scaler")
        if _scaler is not None and getattr(_scaler, "feature_names_in_", None) is not None:
            FEATURE_ORDER = [str(x) for x in _scaler.feature_names_in_]
            if getattr(_scaler, "mean_", None) is not None and len(_scaler.mean_) == len(FEATURE_ORDER):
                DEFAULT_FEATURES = {
                    name: float(val) for name, val in zip(FEATURE_ORDER, _scaler.mean_)
                }
        else:
            FEATURE_ORDER = [
                "age",
                "sex",
                "cp",
                "trestbps",
                "chol",
                "fbs",
                "restecg",
                "thalach",
                "exang",
                "oldpeak",
                "slope",
            ]
            DEFAULT_FEATURES = {k: 0.0 for k in FEATURE_ORDER}
    else:
        ml_load_error = f"Model file not found: {MODEL_PATH}"
except Exception as exc:
    ml_load_error = str(exc)


def run_ml_predict(features_dict):
    if ml_load_error or ml_bundle is None or not FEATURE_ORDER:
        raise RuntimeError(ml_load_error or "Model is not loaded")
    scaler = ml_bundle["scaler"]
    model = ml_bundle["model"]
    row = {k: float(features_dict[k]) for k in FEATURE_ORDER}
    X = scaler.transform(pd.DataFrame([row], columns=FEATURE_ORDER))
    pred = int(model.predict(X)[0])
    if hasattr(model, "predict_proba"):
        risk_score = float(model.predict_proba(X)[0][1])
    else:
        risk_score = float(pred)
    return pred, risk_score


def band_from_score(risk_score):
    """risk_score = P(class 1) from the classifier."""
    if risk_score < 0.3:
        return "Low Risk", "Maintain a heart-healthy lifestyle and regular check-ups."
    if risk_score < 0.7:
        return "Moderate Risk", "Focus on diet, exercise, and follow-up with your clinician."
    return "High Risk", "Consult a cardiologist for further evaluation."


def ensure_db_ready():
    if db_error:
        return jsonify({"success": False, "message": db_error}), 500
    return None


@app.route("/api/ocr-status", methods=["GET"])
def ocr_status():
    """Debug: whether Tesseract was resolved (after restart, re-check PATH)."""
    exe = resolve_tesseract_executable()
    return jsonify(
        {
            "tesseract_found": bool(exe),
            "tesseract_path": exe,
            "hint": "If winget UB-Mannheim fails (403), use: winget install -e --id tesseract-ocr.tesseract "
            "(GitHub). Or: https://github.com/UB-Mannheim/tesseract/wiki",
        }
    )


def serialize_user(user_doc):
    if not user_doc:
        return None
    user_id = str(user_doc.get("_id", ""))
    return {
        "id": user_id,
        "username": user_doc.get("username", "User"),
        "email": user_doc.get("email", ""),
        "patient_id": f"#{user_id[-6:].upper()}" if user_id else "#000000",
    }


def serialize_user_admin(user_doc):
    row = serialize_user(user_doc)
    if not row:
        return None
    created = user_doc.get("created_at")
    row["created_at"] = created.isoformat() if hasattr(created, "isoformat") else None
    return row


def get_bearer_admin_token():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:].strip()
    return (request.headers.get("X-Admin-Token") or "").strip()


def require_admin():
    expected = (os.getenv("ADMIN_TOKEN") or "").strip()
    if not expected:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Admin API not configured: set ADMIN_TOKEN in backend .env",
                }
            ),
            503,
        )
    if get_bearer_admin_token() != expected:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    return None

# ------------------ PREDICT (ML model + optional OCR on uploaded report) ------------------
@app.route("/predict", methods=["POST"])
def predict():
    db_check = ensure_db_ready()
    if db_check:
        return db_check
    try:
        if ml_load_error or not FEATURE_ORDER or ml_bundle is None:
            return (
                jsonify({"success": False, "message": ml_load_error or "Model not available"}),
                503,
            )

        user = "Guest"
        body = dict(DEFAULT_FEATURES)
        provided_fields = set()
        ocr_filename = None
        ocr_text_snippet = None
        ocr_bp = ocr_chol = None
        ocr_warning = None

        ct = (request.content_type or "").lower()
        multipart = "multipart/form-data" in ct

        if request.is_json and not multipart:
            data = request.get_json(silent=True) or {}
            user = (data.get("user") or data.get("email") or "Guest").strip() or "Guest"
            for k in FEATURE_ORDER:
                raw = data.get(k)
                if raw is not None and raw != "":
                    body[k] = float(raw)
                    provided_fields.add(k)
        else:
            src = request.form
            user = (src.get("user") or src.get("email") or "Guest").strip() or "Guest"
            for k in FEATURE_ORDER:
                raw = src.get(k)
                if raw is not None and raw != "":
                    body[k] = float(raw)
                    provided_fields.add(k)

            upload = request.files.get("file")
            if upload and upload.filename:
                ocr_filename = secure_filename(upload.filename)
                filepath = os.path.join(UPLOAD_FOLDER, ocr_filename)
                upload.save(filepath)
                try:
                    image = Image.open(filepath)
                    image.load()
                except Exception as img_exc:
                    return (
                        jsonify(
                            {
                                "success": False,
                                "message": f"Could not open image file (use PNG/JPG): {img_exc}",
                            }
                        ),
                        400,
                    )

                tess_exe = resolve_tesseract_executable()
                if not tess_exe:
                    ocr_warning = (
                        "Tesseract OCR is not installed or not on PATH. "
                        "Prediction used your form values only. "
                        "Install (if Mannheim mirror returns 403): "
                        "winget install -e --id tesseract-ocr.tesseract, or "
                        "https://github.com/UB-Mannheim/tesseract/wiki "
                        "Then restart Flask."
                    )
                else:
                    pytesseract.pytesseract.tesseract_cmd = tess_exe
                    try:
                        text = pytesseract.image_to_string(image, config="--psm 6")
                        ocr_text_snippet = text[:500]
                        ocr_bp, ocr_chol = extract_bp_chol_from_ocr(text)
                        if ocr_bp is not None:
                            body["trestbps"] = float(ocr_bp)
                            provided_fields.add("trestbps")
                        if ocr_chol is not None:
                            body["chol"] = float(ocr_chol)
                            provided_fields.add("chol")
                    except Exception as ocr_exc:
                        ocr_warning = f"OCR failed; using form values only. ({ocr_exc})"
        upload_present = bool(ocr_filename)
        if not upload_present and len(provided_fields) < len(FEATURE_ORDER):
            missing = [k for k in FEATURE_ORDER if k not in provided_fields]
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Manual mode requires all model attributes when no report is uploaded.",
                        "missing_fields": missing,
                    }
                ),
                400,
            )
        if upload_present and not provided_fields:
            # File-only mode: allow OCR + defaults for non-extracted fields.
            ocr_warning = (
                ocr_warning
                or "File-only mode: missing attributes were filled with model baseline defaults."
            )
        defaults_used = [k for k in FEATURE_ORDER if k not in provided_fields]

        pred, risk_score = run_ml_predict(body)
        status, rec = band_from_score(risk_score)
        risk_pct = int(round(risk_score * 100))

        mongo_doc = {
            "user": user,
            "model_input": body,
            "prediction": pred,
            "risk_score": risk_score,
            "age": int(body["age"]),
            "bp": int(body["trestbps"]),
            "chol": int(body["chol"]),
            "smoking": "Yes" if int(body["exang"]) == 1 else "No",
            "risk": risk_pct,
            "status": status,
            "recommendation": rec,
            "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "input_mode": "file_only" if upload_present and not provided_fields else ("hybrid" if upload_present else "manual"),
            "defaults_used": defaults_used,
        }
        if ocr_filename:
            mongo_doc["ocr_file"] = ocr_filename
        if ocr_text_snippet:
            mongo_doc["ocr_text"] = ocr_text_snippet
        if ocr_bp is not None or ocr_chol is not None:
            mongo_doc["ocr_used"] = {
                "trestbps": ocr_bp,
                "chol": ocr_chol,
            }
        if ocr_warning:
            mongo_doc["ocr_warning"] = ocr_warning

        patients_col.insert_one(mongo_doc)

        out = {
            "success": True,
            "prediction": pred,
            "risk_score": risk_score,
            "risk": f"{risk_pct}%",
            "status": status,
            "recommendation": rec,
        }
        if ocr_filename:
            out["file"] = ocr_filename
        if ocr_text_snippet:
            out["ocr_text"] = ocr_text_snippet
        if ocr_bp is not None or ocr_chol is not None:
            out["ocr_override"] = {"trestbps": ocr_bp, "chol": ocr_chol}
        if ocr_warning:
            out["ocr_warning"] = ocr_warning
        if defaults_used:
            out["defaults_used"] = defaults_used

        return jsonify(out)

    except ValueError as ve:
        return jsonify({"success": False, "message": f"Invalid numeric input: {ve}"}), 400
    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500

# ------------------ GET ALL PATIENTS ------------------
@app.route("/patients", methods=["GET"])
def get_patients():
    db_check = ensure_db_ready()
    if db_check:
        return db_check
    try:
        data = []
        for item in patients_col.find().sort("_id", -1):
            item["_id"] = str(item["_id"])
            data.append(item)

        return jsonify({
            "success": True,
            "data": data
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# ------------------ HISTORY ------------------
@app.route("/api/history", methods=["GET"])
def get_history():
    db_check = ensure_db_ready()
    if db_check:
        return db_check
    data = []
    for item in patients_col.find().sort("_id", -1):
        data.append({
            "user": item.get("user"),
            "risk": item.get("risk"),
            "date": item.get("date")
        })
    return jsonify(data)

# ------------------ SEND OTP ------------------
@app.route("/api/send-otp", methods=["POST"])
def send_otp():
    db_check = ensure_db_ready()
    if db_check:
        return db_check
    email = request.json.get("email")
    otp = str(random.randint(100000, 999999))

    otp_col.update_one(
        {"email": email},
        {"$set": {"otp": otp}},
        upsert=True
    )

    print("OTP:", otp)  # simulate email
    return jsonify({"success": True, "message": "OTP sent"})


@app.route("/api/signup", methods=["POST"])
def signup():
    db_check = ensure_db_ready()
    if db_check:
        return db_check

    data = request.json or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not username or not email or not password:
        return jsonify({"success": False, "message": "username, email, and password are required"}), 400

    if users_col.find_one({"email": email}):
        return jsonify({"success": False, "message": "Email is already registered"}), 409

    result = users_col.insert_one(
        {
            "username": username,
            "email": email,
            "password": password,
            "created_at": datetime.now(timezone.utc),
        }
    )
    user = users_col.find_one({"_id": result.inserted_id})
    return jsonify({"success": True, "user": serialize_user(user)})


@app.route("/api/login", methods=["POST"])
def login():
    db_check = ensure_db_ready()
    if db_check:
        return db_check

    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"success": False, "message": "email and password are required"}), 400

    user = users_col.find_one({"email": email, "password": password})
    if not user:
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    return jsonify({"success": True, "user": serialize_user(user)})


@app.route("/api/user-profile", methods=["GET"])
def user_profile():
    db_check = ensure_db_ready()
    if db_check:
        return db_check

    email = (request.args.get("email") or "").strip().lower()
    user_id = (request.args.get("userId") or "").strip()

    user = None
    if email:
        user = users_col.find_one({"email": email})
    elif user_id:
        try:
            user = users_col.find_one({"_id": ObjectId(user_id)})
        except Exception:
            user = None
    else:
        return jsonify({"success": False, "message": "email or userId query param is required"}), 400

    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    return jsonify({"success": True, "user": serialize_user(user)})

# ------------------ ADMIN (monitor users & predictions) ------------------
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    admin_email = (os.getenv("ADMIN_EMAIL") or "").strip().lower()
    admin_password = (os.getenv("ADMIN_PASSWORD") or "").strip()
    admin_token = (os.getenv("ADMIN_TOKEN") or "").strip()

    if not admin_email or not admin_password or not admin_token:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Configure ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_TOKEN in backend .env",
                }
            ),
            503,
        )

    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if email != admin_email or password != admin_password:
        return jsonify({"success": False, "message": "Invalid admin credentials"}), 401

    return jsonify({"success": True, "token": admin_token})


@app.route("/api/admin/summary", methods=["GET"])
def admin_summary():
    auth_err = require_admin()
    if auth_err:
        return auth_err
    db_check = ensure_db_ready()
    if db_check:
        return db_check
    try:
        return jsonify(
            {
                "success": True,
                "counts": {
                    "users": users_col.count_documents({}),
                    "patients": patients_col.count_documents({}),
                    "otp_records": otp_col.count_documents({}),
                },
            }
        )
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500


@app.route("/api/admin/users", methods=["GET"])
def admin_list_users():
    auth_err = require_admin()
    if auth_err:
        return auth_err
    db_check = ensure_db_ready()
    if db_check:
        return db_check
    try:
        users = []
        for doc in users_col.find({}).sort("created_at", -1):
            row = serialize_user_admin(doc)
            if row:
                users.append(row)
        return jsonify({"success": True, "data": users})
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500


@app.route("/api/admin/patients", methods=["GET"])
def admin_list_patients():
    auth_err = require_admin()
    if auth_err:
        return auth_err
    db_check = ensure_db_ready()
    if db_check:
        return db_check
    try:
        data = []
        for item in patients_col.find().sort("_id", -1):
            item["_id"] = str(item["_id"])
            data.append(item)
        return jsonify({"success": True, "data": data})
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500


# ------------------ RESET PASSWORD ------------------
@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    db_check = ensure_db_ready()
    if db_check:
        return db_check
    data = request.json
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("newPassword")

    record = otp_col.find_one({"email": email})

    if record and record["otp"] == otp:
        users_col.update_one(
            {"email": email},
            {"$set": {"password": new_password}},
            upsert=True
        )
        return jsonify({"success": True, "message": "Password updated!"})
    else:
        return jsonify({"success": False, "message": "Invalid OTP"})

# ------------------ RUN ------------------
if __name__ == "__main__":
    # Render and similar hosts set PORT; bind on all interfaces in that case.
    _port = int(os.getenv("PORT", "5000"))
    _default_host = "0.0.0.0" if os.getenv("PORT") else "127.0.0.1"
    app.run(
        debug=os.getenv("FLASK_DEBUG", "true").lower() == "true",
        host=os.getenv("HOST", _default_host),
        port=_port,
    )