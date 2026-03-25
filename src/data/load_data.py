# src/data/load_data.py

import pandas as pd
from typing import Tuple


def load_dataset(
    path: str,
    target_col: str
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Load processed dataset and split into features and target.

    Parameters
    ----------
    path : str
        Path to processed CSV file
    target_col : str
        Name of target column

    Returns
    -------
    X : pd.DataFrame
        Feature matrix
    y : pd.Series
        Target vector
    """

    df = pd.read_csv(path)

    if target_col not in df.columns:
        raise ValueError(
            f"Target column '{target_col}' not found. "
            f"Available columns: {list(df.columns)}"
        )

    X = df.drop(columns=[target_col])
    y = df[target_col]

    return X, y
