from fastapi import FastAPI, HTTPException
from rq.job import Job

from .client.rq_client import queue
from .schemas.chat import ChatRequest
from .schemas.document import ProcessDocumentRequest
from .queues.worker import process_document, process_query
from .utils.logger import logger
from .utils.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)


@app.get("/internal/health")
def health():
    """
    Health Check
    """

    return {
        "success": True,
        "message": "Mentrix AI Service is running.",
    }


@app.post("/internal/process-document")
def process_document_endpoint(
    request: ProcessDocumentRequest,
):
    """
    Queue a document for processing.
    """

    logger.info(
        "Received document processing request: %s",
        request.documentId,
    )

    job = queue.enqueue(
        process_document,
        request.documentId,
        request.userId,
        request.storagePath,
        job_timeout="30m",
    )

    return {
        "success": True,
        "message": "Document processing queued successfully.",
        "jobId": job.id,
    }


@app.post("/internal/chat")
def chat(
    request: ChatRequest,
):
    """
    Queue a chat request.
    """

    logger.info(
        "Received chat request for document %s",
        request.documentId,
    )

    job = queue.enqueue(
        process_query,
        request.query,
        request.documentId,
        request.userId,
        job_timeout="10m",
    )

    return {
        "success": True,
        "message": "Chat request queued successfully.",
        "jobId": job.id,
    }


@app.get("/internal/job/{job_id}")
def get_job_status(job_id: str):
    """
    Get RQ job status.
    """

    try:
        job = Job.fetch(
            job_id,
            connection=queue.connection,
        )

    except Exception:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    return {
        "jobId": job.id,
        "status": job.get_status(),
        "result": job.result,
    }