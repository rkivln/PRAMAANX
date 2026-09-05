"""
PRAMAANX — Liveness Detection Module

Provides liveness detection as a separate component.
Outputs: PASS, FAIL, UNCERTAIN

Never converts UNCERTAIN into PASS.
A liveness failure is a high-severity signal.
"""

from .passive import PassiveLiveness

__all__ = ["PassiveLiveness"]
