# src/features/sample_weighting.py

import numpy as np
import pandas as pd

def compute_sample_weights(
    X: pd.DataFrame,
    feature_weights: pd.Series,
    mi_table: pd.Series,
    alpha: float = 0.7,
    beta: float = 1.0
) -> np.ndarray:
    """
    Compute per-sample weights using feature-level WFA weights and MI.

    Parameters
    ----------
    X : pd.DataFrame
        Training features
    feature_weights : pd.Series
        WFA feature weights (indexed by feature name)
    mi_table : pd.Series
        Mutual Information scores (indexed by feature name)
    alpha : float
        Balance between WFA weights and MI
    beta : float
        Scaling factor

    Returns
    -------
    np.ndarray
        Sample weights (1D, length = len(X))
    """

    # --- Align everything safely ---
    common_features = X.columns.intersection(feature_weights.index).intersection(mi_table.index)

    X_aligned = X[common_features]
    fw = feature_weights.loc[common_features]
    mi = mi_table.loc[common_features]

    # --- Normalize ---
    fw_norm = (fw - fw.min()) / (fw.max() - fw.min() + 1e-8)
    mi_norm = (mi - mi.min()) / (mi.max() - mi.min() + 1e-8)

    # --- Feature importance fusion ---
    combined_feature_weights = alpha * fw_norm + (1 - alpha) * mi_norm

    # --- Convert feature importance → sample importance ---
    # Each sample weight = weighted sum of its feature values
    sample_scores = X_aligned.mul(combined_feature_weights, axis=1).sum(axis=1)

    # --- Final normalization ---
    sample_weights = (sample_scores - sample_scores.min()) / (
        sample_scores.max() - sample_scores.min() + 1e-8
    )

    return (1.0 + beta * sample_weights).values
