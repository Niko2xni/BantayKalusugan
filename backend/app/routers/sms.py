import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, crud, security
from ..database import get_db

router = APIRouter(
    prefix="/api/admin/sms",
    tags=["SMS"],
)

def _get_twilio_client():
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    if not account_sid or not auth_token:
        raise HTTPException(
            status_code=500, 
            detail="Twilio credentials (SID/Token) are not configured."
        )
    return Client(account_sid, auth_token)

@router.post("/send", response_model=schemas.MessageResponse)
async def send_sms_notification(
    payload: schemas.SMSNotificationRequest,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.require_admin),
):
    messaging_service_sid = os.getenv("TWILIO_MESSAGING_SERVICE_SID")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")
    
    if not messaging_service_sid and not from_number:
        raise HTTPException(status_code=500, detail="Twilio Messaging Service SID or Phone Number is not configured.")

    # 1. Normalize phone number to E.164 format (e.g., +639...)
    phone = payload.phone_number.strip().replace(" ", "")
    if phone.startswith("09") and len(phone) == 11:
        phone = "+63" + phone[1:]
    elif phone.startswith("9") and len(phone) == 10:
        phone = "+63" + phone
    elif not phone.startswith("+"):
        # Fallback for other formats, try adding +63 if it looks like a local number
        if len(phone) >= 10:
             phone = "+" + phone.lstrip("+")
        else:
             raise HTTPException(status_code=400, detail=f"Invalid phone number format: {phone}")

    try:
        client = _get_twilio_client()
        
        # Build the message creation parameters
        msg_params = {
            "body": payload.message,
            "to": phone
        }
        
        if messaging_service_sid:
            msg_params["messaging_service_sid"] = messaging_service_sid
        else:
            msg_params["from_"] = from_number
            
        message = client.messages.create(**msg_params)

    except TwilioRestException as e:
        error_msg = f"Twilio API Error: {e.status} - {e.msg}"
        print(error_msg)
        raise HTTPException(status_code=502, detail=f"Twilio failure: {e.msg}")
    except Exception as e:
        print(f"Twilio General Exception: {e}")
        raise HTTPException(status_code=500, detail="Internal error communicating with Twilio.")

    # 2. Log the successful sending
    target_id = payload.patient_id if payload.patient_id else 0
    target_type = "patient" if payload.patient_id else "custom_number"
    
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

    return {"message": f"SMS sent successfully! SID: {message.sid}"}

