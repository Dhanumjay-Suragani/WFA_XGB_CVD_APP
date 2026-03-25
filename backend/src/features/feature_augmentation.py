import pandas as pd


def shap_guided_feature_augmentation(X: pd.DataFrame) -> pd.DataFrame:
    """
    Create clinically interpretable interaction features.
    """
    X_aug = X.copy()

    # Age × Cholesterol interaction
    X_aug["age_chol_interaction"] = X["age"] * X["chol"]

    # Blood pressure risk flag
    X_aug["high_bp_flag"] = (X["trestbps"] > 140).astype(int)

    # ST depression severity
    X_aug["severe_oldpeak"] = (X["oldpeak"] > 2.0).astype(int)

    return X_aug
