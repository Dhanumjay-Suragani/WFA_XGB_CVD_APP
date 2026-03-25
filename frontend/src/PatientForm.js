import React, { useState } from "react";
import "./PatientForm.css";
import API_BASE_URL from "./config";

function PatientForm() {

    const [formData, setFormData] = useState({
        age: "",
        sex: "",
        cp: "",
        trestbps: "",
        chol: "",
        fbs: "",
        thalach: "",
        exang: "",
        oldpeak: "",
        slope: ""
    });

    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFile = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        for (let key in formData) {
            data.append(key, formData[key]);
        }

        if (file) {
            data.append("file", file);
        }

        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: "POST",
            body: data
        });

        const res = await response.json();
        setResult(res);
    };

    return (

        <div className="container">

            <h2>Heart Disease Prediction</h2>

            <form onSubmit={handleSubmit}>

                <label>Age</label>
                <input type="number" name="age" onChange={handleChange} />

                <label>Sex (1 = Male, 0 = Female)</label>
                <input type="number" name="sex" onChange={handleChange} />

                <label>Chest Pain Type</label>
                <input type="number" name="cp" onChange={handleChange} />

                <label>Resting Blood Pressure</label>
                <input type="number" name="trestbps" onChange={handleChange} />

                <label>Cholesterol</label>
                <input type="number" name="chol" onChange={handleChange} />

                <label>Fasting Blood Sugar</label>
                <input type="number" name="fbs" onChange={handleChange} />

                <label>Maximum Heart Rate</label>
                <input type="number" name="thalach" onChange={handleChange} />

                <label>Exercise Induced Angina</label>
                <input type="number" name="exang" onChange={handleChange} />

                <label>Oldpeak</label>
                <input type="number" name="oldpeak" onChange={handleChange} />

                <label>Slope</label>
                <input type="number" name="slope" onChange={handleChange} />

                <label>Upload Medical Report</label>
                <input type="file" onChange={handleFile} />

                <button type="submit">Predict Risk</button>

            </form>

            {result && (
                <div className="result">

                    <h3>Prediction Result</h3>

                    <p><b>Risk Percentage:</b> {result.risk}%</p>

                    <p><b>Recommendation:</b> {result.recommendation}</p>

                </div>
            )}

        </div>
    );
}

export default PatientForm;