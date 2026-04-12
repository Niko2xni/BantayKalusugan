"""
Azure services for OCR (Document Intelligence) and Blob Storage.

Provides:
  - upload_to_blob(): Uploads an image to Azure Blob Storage, returns public URL.
  - analyze_document(): Sends an image to Azure AI Document Intelligence, returns raw text.
  - parse_vitals_text(): Extracts structured vital-sign data from raw OCR text.
  - parse_patient_text(): Extracts structured patient demographic data from raw OCR text.
"""

import os
import re
import uuid
from datetime import datetime
from io import BytesIO
from importlib import import_module

try:
    azure_blob = import_module("azure.storage.blob")
    azure_credentials = import_module("azure.core.credentials")
    azure_document_intelligence = import_module("azure.ai.documentintelligence")
    azure_document_models = import_module("azure.ai.documentintelligence.models")
except ImportError as exc:
    BlobServiceClient = None
    BlobSasPermissions = None
    ContentSettings = None
    generate_blob_sas = None
    AzureKeyCredential = None
    DocumentIntelligenceClient = None
    AnalyzeDocumentRequest = None
    _AZURE_IMPORT_ERROR = exc
else:
    BlobServiceClient = azure_blob.BlobServiceClient
    BlobSasPermissions = azure_blob.BlobSasPermissions
    ContentSettings = azure_blob.ContentSettings
    generate_blob_sas = azure_blob.generate_blob_sas
    AzureKeyCredential = azure_credentials.AzureKeyCredential
    DocumentIntelligenceClient = azure_document_intelligence.DocumentIntelligenceClient
    AnalyzeDocumentRequest = azure_document_models.AnalyzeDocumentRequest
    _AZURE_IMPORT_ERROR = None


def _require_azure_sdk(feature_name: str) -> None:
    if _AZURE_IMPORT_ERROR is not None:
        raise RuntimeError(
            "Azure OCR support is unavailable because the Azure SDK packages are not installed. "
            f"Install azure-core, azure-storage-blob, and azure-ai-documentintelligence before using {feature_name}."
        ) from _AZURE_IMPORT_ERROR

# ---------------------------------------------------------------------------
# Azure Clients (lazy-init on first call)
# ---------------------------------------------------------------------------

_blob_service_client = None
_doc_intelligence_client = None


def _get_blob_client():
    global _blob_service_client
    if _blob_service_client is None:
        _require_azure_sdk("blob storage")
        conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        if not conn_str:
            raise RuntimeError("AZURE_STORAGE_CONNECTION_STRING is not set")
        _blob_service_client = BlobServiceClient.from_connection_string(conn_str)
    return _blob_service_client


def _get_doc_intelligence_client():
    global _doc_intelligence_client
    if _doc_intelligence_client is None:
        _require_azure_sdk("Azure Document Intelligence")
        endpoint = os.getenv("AZURE_OCR_ENDPOINT")
        key = os.getenv("AZURE_OCR_KEY")
        if not endpoint or not key:
            raise RuntimeError("AZURE_OCR_ENDPOINT / AZURE_OCR_KEY are not set")
        _doc_intelligence_client = DocumentIntelligenceClient(
            endpoint=endpoint,
            credential=AzureKeyCredential(key),
        )
    return _doc_intelligence_client


# ---------------------------------------------------------------------------
# Blob Storage helpers
# ---------------------------------------------------------------------------

def upload_to_blob(file_bytes: bytes, original_filename: str) -> str:
    """Upload an image to Azure Blob Storage and return the blob URL."""
    _require_azure_sdk("blob uploads")
    container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "documents")
    client = _get_blob_client()

    # Build a unique blob path:  ocr-uploads/2026/04/07/<uuid>_<original>
    now = datetime.utcnow()
    ext = os.path.splitext(original_filename)[1] or ".jpg"
    blob_name = (
        f"ocr-uploads/{now.year}/{now.month:02d}/{now.day:02d}/"
        f"{uuid.uuid4().hex}{ext}"
    )

    # Determine content type
    content_type_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
        ".tiff": "image/tiff",
        ".tif": "image/tiff",
    }
    content_type = content_type_map.get(ext.lower(), "application/octet-stream")

    blob_client = client.get_blob_client(container=container_name, blob=blob_name)
    blob_client.upload_blob(
        file_bytes,
        overwrite=True,
        content_settings=ContentSettings(content_type=content_type),
    )

    return blob_client.url


def download_blob(blob_url: str) -> tuple[bytes, str]:
    """Download a blob from Azure Storage by its full URL.

    Returns (file_bytes, content_type).
    """
    _require_azure_sdk("blob downloads")
    client = _get_blob_client()

    # Parse the blob URL to extract container and blob name.
    # URL format: https://<account>.blob.core.windows.net/<container>/<blob_path>
    from urllib.parse import urlparse

    parsed = urlparse(blob_url)
    # path starts with /<container>/<blob_path>
    path_parts = parsed.path.lstrip("/").split("/", 1)
    if len(path_parts) < 2:
        raise ValueError(f"Cannot parse container/blob from URL: {blob_url}")

    container_name = path_parts[0]
    blob_name = path_parts[1]

    blob_client = client.get_blob_client(container=container_name, blob=blob_name)
    download_stream = blob_client.download_blob()
    file_bytes = download_stream.readall()

    # Try to read content type from blob properties
    properties = blob_client.get_blob_properties()
    content_type = properties.content_settings.content_type or "application/octet-stream"

    return file_bytes, content_type

def generate_blob_sas_url(blob_url: str) -> str:
    """Generate a temporary SAS URL for a blob."""
    _require_azure_sdk("generating blob SAS URLs")
    from urllib.parse import urlparse
    from datetime import datetime, timedelta

    client = _get_blob_client()
    parsed = urlparse(blob_url)
    path_parts = parsed.path.lstrip("/").split("/", 1)
    if len(path_parts) < 2:
        raise ValueError(f"Cannot parse container/blob from URL: {blob_url}")

    container_name = path_parts[0]
    blob_name = path_parts[1]
    
    # We need the connection string to extract the account key
    # In earlier versions, this was easily accessible via client.credential, but parsing the string is safer
    conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
    account_key = None
    for part in conn_str.split(";"):
        if part.startswith("AccountKey="):
            account_key = part.split("=", 1)[1]
            break
            
    if not account_key:
        raise ValueError("Could not find AccountKey in connection string to generate SAS.")

    sas_token = generate_blob_sas(
        account_name=client.account_name,
        container_name=container_name,
        blob_name=blob_name,
        account_key=account_key,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=1),
    )

    return f"{blob_url}?{sas_token}"


# ---------------------------------------------------------------------------
# Document Intelligence OCR
# ---------------------------------------------------------------------------

def analyze_document(file_bytes: bytes) -> str:
    """Send an image to Azure Document Intelligence and return extracted text."""
    _require_azure_sdk("OCR analysis")
    client = _get_doc_intelligence_client()

    poller = client.begin_analyze_document(
        "prebuilt-read",
        body=AnalyzeDocumentRequest(bytes_source=file_bytes),
    )
    result = poller.result()

    # Concatenate all extracted text
    lines = []
    if result.content:
        lines.append(result.content)
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Text → structured data parsers
# ---------------------------------------------------------------------------

def parse_vitals_text(raw_text: str) -> dict:
    """
    Attempt to extract vital sign values from OCR text.

    Returns a dict with keys matching the frontend form field names.
    Missing fields are returned as empty strings so the admin can fill them manually.
    """
    text = raw_text.replace("\n", " ").replace("\r", " ")

    def _find_int(patterns):
        for pat in patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                return m.group(1)
        return ""

    def _find_float(patterns):
        for pat in patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                return m.group(1)
        return ""

    # Blood Pressure  —  look for patterns like "120/80", "BP: 120/80", "Systolic: 120"
    systolic = ""
    diastolic = ""
    bp_match = re.search(
        r"(?:bp|blood\s*pressure)[:\s]*(\d{2,3})\s*/\s*(\d{2,3})", text, re.IGNORECASE
    )
    if bp_match:
        systolic = bp_match.group(1)
        diastolic = bp_match.group(2)
    else:
        # Try standalone "120/80" anywhere
        bp_standalone = re.search(r"\b(\d{2,3})\s*/\s*(\d{2,3})\b", text)
        if bp_standalone:
            s, d = int(bp_standalone.group(1)), int(bp_standalone.group(2))
            if 60 <= s <= 250 and 30 <= d <= 180:
                systolic = str(s)
                diastolic = str(d)

    if not systolic:
        systolic = _find_int([
            r"(?:systolic|sys)[:\s]*(\d{2,3})",
        ])
    if not diastolic:
        diastolic = _find_int([
            r"(?:diastolic|dia)[:\s]*(\d{2,3})",
        ])

    heart_rate = _find_int([
        r"(?:heart\s*rate|hr|pulse|pr)[:\s]*(\d{2,3})",
        r"(\d{2,3})\s*bpm",
    ])

    temperature = _find_float([
        r"(?:temp(?:erature)?|t)[:\s]*(\d{2,3}(?:\.\d{1,2})?)\s*[°º]?\s*[cCfF]?",
    ])

    spo2 = _find_int([
        r"(?:spo2|sp02|spo₂|o2\s*sat|oxygen\s*sat(?:uration)?)[:\s]*(\d{2,3})",
        r"(\d{2,3})\s*%\s*(?:spo2|sp02|o2)",
    ])

    respiratory_rate = _find_int([
        r"(?:respiratory\s*rate|resp(?:iration)?|rr)[:\s]*(\d{1,2})",
    ])

    weight = _find_float([
        r"(?:weight|wt|wgt)[:\s]*(\d{2,3}(?:\.\d{1,2})?)\s*(?:kg)?",
    ])

    height = _find_float([
        r"(?:height|ht|hgt)[:\s]*(\d{2,3}(?:\.\d{1,2})?)\s*(?:cm)?",
    ])

    return {
        "systolic": systolic,
        "diastolic": diastolic,
        "heartRate": heart_rate,
        "temperature": temperature,
        "spO2": spo2,
        "respiratoryRate": respiratory_rate,
        "weight": weight,
        "height": height,
    }


def parse_patient_text(raw_text: str) -> dict:
    """
    Attempt to extract patient demographic fields from OCR text.

    Returns a dict with keys matching the frontend PatientModal form field names.
    """
    text = raw_text.replace("\r", " ")

    def _find(patterns):
        for pat in patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                return m.group(1).strip()
        return ""

    first_name = _find([
        r"(?:first\s*name|given\s*name|fname)[:\s]+([A-Za-zÀ-ÿ\- ]+?)(?:\n|$|,)",
    ])
    last_name = _find([
        r"(?:last\s*name|surname|family\s*name|lname)[:\s]+([A-Za-zÀ-ÿ\- ]+?)(?:\n|$|,)",
    ])

    # Full name fallback: "Name: Juan Dela Cruz"
    if not first_name and not last_name:
        name_match = re.search(
            r"(?:name|patient)[:\s]+([A-Za-zÀ-ÿ\- ]+?)(?:\n|$|,)", text, re.IGNORECASE
        )
        if name_match:
            parts = name_match.group(1).strip().split()
            if len(parts) >= 2:
                first_name = parts[0]
                last_name = " ".join(parts[1:])
            elif len(parts) == 1:
                first_name = parts[0]

    dob = _find([
        r"(?:date\s*of\s*birth|dob|birth\s*date|birthday)[:\s]+(\d{1,4}[\-/\.]\d{1,2}[\-/\.]\d{1,4})",
    ])
    # Try to normalise to YYYY-MM-DD
    if dob:
        for fmt in ("%m/%d/%Y", "%d/%m/%Y", "%m-%d-%Y", "%d-%m-%Y", "%Y-%m-%d", "%Y/%m/%d"):
            try:
                dob = datetime.strptime(dob, fmt).strftime("%Y-%m-%d")
                break
            except ValueError:
                continue

    gender = ""
    gender_match = re.search(
        r"(?:sex|gender)[:\s]*(male|female|m|f)\b", text, re.IGNORECASE
    )
    if gender_match:
        g = gender_match.group(1).strip().upper()
        gender = "Male" if g in ("M", "MALE") else "Female"

    phone = _find([
        r"(?:phone|mobile|contact|tel(?:ephone)?|cell)[:\s#]*([\d\-\+\(\) ]{7,15})",
    ])

    address = _find([
        r"(?:address|addr)[:\s]+(.+?)(?:\n|$)",
    ])

    email = _find([
        r"(?:email|e-mail)[:\s]+([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})",
        r"\b([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})\b",
    ])

    return {
        "firstName": first_name,
        "lastName": last_name,
        "date_of_birth": dob,
        "gender": gender,
        "phone": phone,
        "address": address,
        "email": email,
    }
