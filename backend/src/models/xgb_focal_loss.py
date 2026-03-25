# src/models/xgb_focal_loss.py

import numpy as np


def focal_sample_weights(y_true, alpha=0.25, gamma=2.0):
    """
    Compute focal-loss-inspired sample weights for binary classification.

    Parameters
    ----------
    y_true : array-like
        Ground truth labels (0 or 1)
    alpha : float
        Class balancing factor
    gamma : float
        Focusing parameter

    Returns
    -------
    weights : np.ndarray
        Sample weights to be passed to XGBClassifier.fit()
    """

    y_true = np.asarray(y_true).astype(int)

    # Weight positives and negatives differently
    weights = np.where(
        y_true == 1,
        alpha * (1.0 - y_true) ** gamma,
        (1.0 - alpha) * y_true ** gamma
    )

    # Numerical stability
    return weights + 1e-6
