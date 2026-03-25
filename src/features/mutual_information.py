# src/features/mutual_information.py

import pandas as pd
import numpy as np
from sklearn.feature_selection import mutual_info_classif


def compute_mutual_information(
    X: pd.DataFrame,
    y: pd.Series,
    random_state: int = 42
) -> pd.Series:
    """
    Compute Mutual Information scores for numeric features only.
    """

    # Select numeric columns only (CRITICAL)
    X_numeric = X.select_dtypes(include=[np.number])

    if X_numeric.shape[1] == 0:
        raise ValueError("No numeric features found for MI computation.")

    mi = mutual_info_classif(
        X_numeric,
        y,
        random_state=random_state,
        discrete_features="auto"
    )

    mi_scores = pd.Series(
        mi,
        index=X_numeric.columns,
        name="mutual_information"
    )

    # Reindex to match original feature space (fill non-numeric with 0)
    mi_scores = mi_scores.reindex(X.columns, fill_value=0.0)

    return mi_scores
