"""
OCR Router — Admin-only endpoints for scanning documents via Azure AI.

POST /api/admin/ocr/scan-vitals   → Extract vital-sign fields from an image
POST /api/admin/ocr/scan-patient  → Extract patient demographic fields from an image

Both endpoints:
  1. Upload the image to Azure Blob Storage (paper trail).
  2. Send the image to Azure Document Intelligence for text extraction.
  3. Parse the extracted text into structured data.
  4. Return { extractedData: {...}, imageUrl: "...", rawText: "..." }.
"""

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, security
from ..azure_service import (
    upload_to_blob,
    analyze_document,
    parse_vitals_text,
    parse_patient_text,
)

router = APIRouter(prefix="/api/admin/ocr", tags=["OCR"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def _read_and_validate(file: UploadFile) -> bytes:
    """Read the upload, validate size and content type."""
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Only image files are accepted. Received: {content_type}",
        )
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10 MB.",
        )
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")
    return data


@router.post("/scan-vitals")
async def scan_vitals(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    """OCR a document image and return extracted vital-sign data."""
    file_bytes = await _read_and_validate(file)

    try:
        image_url = upload_to_blob(file_bytes, file.filename or "scan.jpg")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Blob upload failed: {exc}")

    try:
        raw_text = analyze_document(file_bytes)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OCR analysis failed: {exc}")

    extracted = parse_vitals_text(raw_text)

    return {
        "extractedData": extracted,
        "imageUrl": image_url,
        "rawText": raw_text,
    }


@router.post("/scan-patient")
async def scan_patient(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    """OCR a document image and return extracted patient demographic data."""
    file_bytes = await _read_and_validate(file)

    try:
        image_url = upload_to_blob(file_bytes, file.filename or "scan.jpg")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Blob upload failed: {exc}")

    try:
        raw_text = analyze_document(file_bytes)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OCR analysis failed: {exc}")

    extracted = parse_patient_text(raw_text)

    return {
        "extractedData": extracted,
        "imageUrl": image_url,
        "rawText": raw_text,
    }
