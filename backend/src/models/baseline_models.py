import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score, roc_auc_score)
from xgboost import XGBClassifier


class BaselineModels:
    def __init__(self, random_state: int = 42):
        self.random_state = random_state

        self.models = {
            "logistic_regression": LogisticRegression(
                max_iter=1000,
                random_state=random_state
            ),
            "random_forest": RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                random_state=random_state
            ),
            "xgboost": XGBClassifier(
                n_estimators=200,
                max_depth=5,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                eval_metric="logloss",
                random_state=random_state
            )
        }

    def train(self, X_train, y_train):
        for name, model in self.models.items():
            model.fit(X_train, y_train)

    from sklearn.metrics import roc_auc_score

    def evaluate(self, X_test, y_test):
        results = {}

        for name, model in self.models.items():
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]

            results[name] = {
                "accuracy": accuracy_score(y_test, y_pred),
                "precision": precision_score(y_test, y_pred),
                "recall": recall_score(y_test, y_pred),
                "f1_score": f1_score(y_test, y_pred),
                "roc_auc": roc_auc_score(y_test, y_prob)
            }

        return results


    def save(self, path: str):
        joblib.dump(self.models, path)
