# src/data/split_data.py

from typing import Tuple
import pandas as pd
from sklearn.model_selection import train_test_split


def split_data(
    X: pd.DataFrame,
    y: pd.Series,
    test_size: float = 0.2,
    val_size: float = 0.1,
    stratify: bool = True,
    random_state: int = 42,
) -> Tuple[
    pd.DataFrame, pd.DataFrame, pd.DataFrame,
    pd.Series, pd.Series, pd.Series
]:
    """
    Split dataset into train, validation, and test sets.

    Returns
    -------
    X_train, X_val, X_test, y_train, y_val, y_test
    """

    strat = y if stratify else None

    # First split: Train + Temp
    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        test_size=test_size,
        stratify=strat,
        random_state=random_state,
    )

    # Adjust validation size relative to remaining data
    val_relative_size = val_size / (1.0 - test_size)

    strat_temp = y_temp if stratify else None

    # Second split: Validation + Test
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp,
        y_temp,
        test_size=1.0 - val_relative_size,
        stratify=strat_temp,
        random_state=random_state,
    )

    return X_train, X_val, X_test, y_train, y_val, y_test
