import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Resolve the backend root directory and load backend/.env explicitly
config_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(config_dir)
env_path = os.path.join(backend_root, ".env")
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Revenue Hub API"
    API_V1_STR: str = "/api"
    
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_CLIENT_EMAIL: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
    FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "")
    FIREBASE_STORAGE_BUCKET: str = os.getenv("FIREBASE_STORAGE_BUCKET", "")
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    DEVELOPMENT_MOCK: bool = os.getenv("DEVELOPMENT_MOCK", "false").lower() == "true"
    
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "no-reply@revenue-intelligence.com")
    
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_NUMBER: str = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    RATE_LIMIT_PUBLIC: int = int(os.getenv("RATE_LIMIT_PUBLIC", "100"))
    RATE_LIMIT_AUTHENTICATED: int = int(os.getenv("RATE_LIMIT_AUTHENTICATED", "200"))
    
    class Config:
        case_sensitive = True

settings = Settings()
