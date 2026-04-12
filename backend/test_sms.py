import os
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

load_dotenv()

def test_sms():
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")
    messaging_service_sid = os.getenv("TWILIO_MESSAGING_SERVICE_SID")

    if not account_sid or not auth_token:
        print("Error: Twilio credentials are not set correctly in your backend/.env file.")
        print("Please ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set.")
        return
        
    if not from_number and not messaging_service_sid:
        print("Error: Provide either TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID.")
        return

    phone = input("Enter recipient phone number (e.g. +639123456789): ").strip()
    if not phone:
        return

    msg = "This is a test notification from BantayKalusugan via Twilio SMS."
    
    sender_info = messaging_service_sid if messaging_service_sid else from_number
    print(f"Sending test SMS to {phone} from {sender_info}...")
    try:
        client = Client(account_sid, auth_token)
        msg_params = {"body": msg, "to": phone}
        if messaging_service_sid:
            msg_params["messaging_service_sid"] = messaging_service_sid
        else:
            msg_params["from_"] = from_number
            
        message = client.messages.create(**msg_params)
        print(f"✅ SMS sent successfully! SID: {message.sid}")
        print(f"Status: {message.status}")
    except TwilioRestException as e:
        print(f"⚠️ Failed to send SMS (Twilio Error {e.status}):")
        print(e.msg)
    except Exception as e:
        print(f"❌ Error communicating with Twilio API: {e}")

if __name__ == "__main__":
    test_sms()

