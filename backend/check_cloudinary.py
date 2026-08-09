import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import cloudinary.api

load_dotenv()

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

if not all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET]):
    print("❌ Cloudinary credentials not found in .env file.")
    print("Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.")
    exit(1)

print(f"Connecting to Cloudinary as: {CLOUDINARY_CLOUD_NAME}...")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)

try:
    # Check if we can ping the API
    result = cloudinary.api.ping()
    if result.get('status') == 'ok':
        print("✅ Cloudinary connection successful!")
    else:
        print("❌ Cloudinary connection failed. Check your API Key and Secret.")
        
except Exception as e:
    print(f"❌ Cloudinary error: {e}")
