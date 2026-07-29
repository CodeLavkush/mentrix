import logging
import sys

from .config import settings


def setup_logger() -> logging.Logger:
    logger = logging.getLogger("mentrix-ai")

    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    console = logging.StreamHandler(sys.stdout)
    console.setFormatter(formatter)

    logger.addHandler(console)
    logger.propagate = False

    return logger


logger = setup_logger()