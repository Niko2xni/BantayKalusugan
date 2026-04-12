"""
Admin Documents Router — Secure proxy for viewing private Azure Blob documents.

GET /api/admin/documents/view?url=<blob_url>
    → Requires admin auth.  Fetches the blob from Azure and streams it back.

This avoids the need for public access on the storage account while still
allowing authenticated admins to view scanned source documents.
"""

from fastapi import APIRouter, Depends, Query, HTTPException, Request
from fastapi.responses import Response, RedirectResponse
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from ..database import get_db
from .. import models, security
from ..azure_service import download_blob, generate_blob_sas_url

router = APIRouter(prefix="/api/admin/documents", tags=["Admin Documents"])


def get_admin_from_query(request: Request, db: Session = Depends(get_db)) -> models.User:
    token = request.query_params.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token in query parameters")
    
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id = int(user_id)
        role = payload.get("role")
        if role != "admin":
             raise HTTPException(status_code=403, detail="Admin access required")
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return user

@router.get("/view")
def view_document(
    url: str = Query(..., description="Full Azure Blob URL of the document to view"),
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_admin_from_query),
):
    """Securely redirect to a temporary SAS URL for authenticated admins."""
    # Basic validation — only allow Azure Blob Storage URLs
    if "blob.core.windows.net" not in url:
        raise HTTPException(
            status_code=400,
            detail="Invalid document URL. Only Azure Blob Storage URLs are supported.",
        )

    try:
        sas_url = generate_blob_sas_url(url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to generate SAS token for document: {exc}",
        )

    return RedirectResponse(url=sas_url)
