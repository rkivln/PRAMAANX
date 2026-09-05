"""
PRAMAANX — Registry Inference Module

Provides reference matching interfaces:
- Document template matching
- Stamp/emblem reference matching
- Blacklist/watchlist matching
- Authorized border reference records

Never hard-code blacklists inside application code.
"""

from .stamp import StampMatcher
from .blacklist import BlacklistChecker

__all__ = ["StampMatcher", "BlacklistChecker"]
