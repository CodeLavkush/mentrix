from pathlib import Path
import os
import tempfile
import uuid

import cv2

from src.utils.logger import logger


class ImagePreprocessor:
    """
    Preprocess images before OCR.

    Optimized for Gemini Vision OCR.
    """

    MAX_IMAGE_SIZE = 1800
    JPEG_QUALITY = 85
    OUTPUT_EXTENSION = ".jpg"

    def preprocess(self, image_path: Path) -> Path:
        """
        Preprocess an image and return the path
        to the processed image.
        """

        logger.debug(
            "Preprocessing image: %s",
            image_path.name,
        )

        image = cv2.imread(str(image_path))

        if image is None:
            raise ValueError(
                f"Unable to read image: {image_path}"
            )

        height, width = image.shape[:2]

        logger.debug(
            "Original image size: %dx%d",
            width,
            height,
        )

        # Resize only if image is too large
        scale = min(
            self.MAX_IMAGE_SIZE / width,
            self.MAX_IMAGE_SIZE / height,
            1.0,
        )

        if scale < 1.0:
            image = cv2.resize(
                image,
                None,
                fx=scale,
                fy=scale,
                interpolation=cv2.INTER_AREA,
            )

            logger.debug(
                "Image resized to %dx%d",
                image.shape[1],
                image.shape[0],
            )

        # Apply denoising and sharpening only for
        # medium/large images.
        if max(image.shape[:2]) > 1200:

            image = cv2.fastNlMeansDenoisingColored(
                image,
                None,
                3,
                3,
                7,
                21,
            )

            blurred = cv2.GaussianBlur(
                image,
                (3, 3),
                0,
            )

            image = cv2.addWeighted(
                image,
                1.2,
                blurred,
                -0.2,
                0,
            )

        temp_dir = Path(tempfile.gettempdir())

        processed_path = (
            temp_dir
            / f"{uuid.uuid4().hex}{self.OUTPUT_EXTENSION}"
        )

        success = cv2.imwrite(
            str(processed_path),
            image,
            [
                cv2.IMWRITE_JPEG_QUALITY,
                self.JPEG_QUALITY,
            ],
        )

        if not success:
            raise RuntimeError(
                f"Failed to write processed image: {processed_path}"
            )

        file_size_mb = (
            os.path.getsize(processed_path)
            / (1024 * 1024)
        )

        logger.debug(
            "Processed image saved to %s",
            processed_path,
        )

        logger.debug(
            "Final image size: %dx%d",
            image.shape[1],
            image.shape[0],
        )

        logger.debug(
            "Processed image file size: %.2f MB",
            file_size_mb,
        )

        return processed_path


image_preprocessor = ImagePreprocessor()