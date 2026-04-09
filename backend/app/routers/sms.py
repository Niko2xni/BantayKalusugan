import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, crud, security
from ..database import get_db

router = APIRouter(
    prefix="/api/admin/sms",
    tags=["SMS"],
)

SMS_API_URL = "https://smsapiph.onrender.com/api/v1/send/sms"

@router.post("/send", response_model=schemas.MessageResponse)
async def send_sms_notification(
    payload: schemas.SMSNotificationRequest,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    api_key = os.getenv("SMS_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY":
        raise HTTPException(status_code=500, detail="SMS API Key is not configured on the server.")

    # Prepare external API request
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    # Ensure phone number format is correct (SMS API PH expects +639...)
    # We will just pass it, assuming the frontend/user configures it correctly 
    # but let's do a basic check if it starts with 09 and fix it to +639.
    phone = payload.phone_number
    if phone.startswith("09"):
        phone = "+63" + phone[1:]

    body = {
        "recipient": phone,
        "message": payload.message
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(SMS_API_URL, json=body, headers=headers, timeout=10.0)
            
            # Raise exception if status code is an error
            response.raise_for_status()
            
    except httpx.HTTPStatusError as e:
        error_msg = f"SMS API Error: {e.response.status_code} - {e.response.text}"
        print(error_msg)
        raise HTTPException(status_code=502, detail="Failed to send SMS via remote provider.")
    except Exception as e:
        print(f"SMS API Exception: {e}")
        raise HTTPException(status_code=500, detail="Internal error communicating with SMS provider.")

    # Log the successful sending
    target_id = payload.patient_id if payload.patient_id else 0
    target_type = "patient" if payload.patient_id else "custom_number"
    
    # Optional: fetch patient name for better log details
    patient_name = "Unknown"
    if payload.patient_id:
        patient = crud.get_user(db, user_id=payload.patient_id)
        if patient:
            patient_name = f"{patient.first_name} {patient.last_name}"

    log_details = f"Sent SMS notification to {phone}"
    if payload.patient_id:
        log_details += f" (Patient: {patient_name})"

    crud.create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="SEND_SMS",
        target_id=target_id,
        target_type=target_type,
        details=log_details
    )

    return {"message": "SMS notification sent successfully!"}
