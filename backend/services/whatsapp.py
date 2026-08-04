import httpx
from config import WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID
from datetime import datetime


async def send_whatsapp_message(phone_number: str, message: str) -> bool:
    """
    Send a WhatsApp message via Meta WhatsApp Cloud API.

    This is the primary reminder channel. Structured as a swappable function
    so Twilio SMS can be added as a fallback later.

    Args:
        phone_number: Recipient phone number (with country code, e.g. "919876543210")
        message: The text message to send

    Returns:
        True if sent successfully, False otherwise
    """
    if not WHATSAPP_ACCESS_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
        print(f"[WARN] WhatsApp not configured. Would send to {phone_number}: {message}")
        return False

    url = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"

    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "text",
        "text": {"body": message}
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)

            if response.status_code == 200:
                print(f"[OK] WhatsApp sent to {phone_number}")
                return True
            else:
                print(f"[ERROR] WhatsApp failed ({response.status_code}): {response.text}")
                return False
    except Exception as e:
        print(f"[ERROR] WhatsApp error: {e}")
        return False


async def send_sms_message(phone_number: str, message: str) -> bool:
    """
    Fallback SMS sender placeholder.
    Implement with Twilio or any SMS provider when needed.
    """
    print(f"[INFO] SMS fallback (not configured). Would send to {phone_number}: {message}")
    return False


async def send_reminder(phone_number: str, message: str) -> bool:
    """
    Send a reminder via the best available channel.
    Tries WhatsApp first, falls back to SMS.
    """
    sent = await send_whatsapp_message(phone_number, message)
    if not sent:
        sent = await send_sms_message(phone_number, message)
    return sent
