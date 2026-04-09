import os
from dotenv import load_dotenv
import httpx
import asyncio

load_dotenv()

async def test_sms():
    api_key = os.getenv("SMS_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY":
        print("Error: SMS_API_KEY is not set correctly in your backend/.env file.")
        print("Please log in to SMS API PH, gather your API key, and set it first.")
        return

    phone = input("Enter a valid phone number (e.g. +639123456789): ").strip()
    if not phone:
        return

    msg = "This is a test notification from BantayKalusugan via SMS API PH."
    
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    body = {
        "recipient": phone,
        "message": msg
    }

    print(f"Sending test SMS to {phone}...")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://smsapiph.onrender.com/api/v1/send/sms", json=body, headers=headers, timeout=10.0)
            
            if resp.status_code == 200:
                print("✅ SMS sent successfully!")
                print(resp.json())
            else:
                print(f"⚠️ Failed to send SMS (Status {resp.status_code}):")
                print(resp.text)
    except Exception as e:
        print(f"❌ Error communicating with SMS API: {e}")

if __name__ == "__main__":
    asyncio.run(test_sms())
