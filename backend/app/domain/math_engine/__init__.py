"""
Math Engine - AUREA Domain Core
"""

from .e1rm import get_best_e1rm, calculate_e1rm_epley, calculate_e1rm_from_rpe
from .acwr import calculate_ewma, calculate_acwr_coupled
from .snc_fatigue import calculate_snc_fatigue_dissipation, compute_session_fatigue

__all__ = [
    "get_best_e1rm",
    "calculate_e1rm_epley",
    "calculate_e1rm_from_rpe",
    "calculate_ewma",
    "calculate_acwr_coupled",
    "calculate_snc_fatigue_dissipation",
    "compute_session_fatigue"
]
