import uvicorn

from src.server import app
from src.utils.config import settings
from src.utils.logger import logger


def main() -> None:
    logger.info("Starting %s...", settings.APP_NAME)

    uvicorn.run(
        app="src.server:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.APP_ENV == "development",
        log_level="info",
    )


if __name__ == "__main__":
    main()