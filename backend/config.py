import os
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
PORT = int(os.getenv("PORT", "8000"))

def reload_config():
    global SUPABASE_URL, SUPABASE_KEY, DATABASE_URL, GEMINI_API_KEY, OPENAI_API_KEY
    load_dotenv(dotenv_path=ENV_PATH, override=True)
    SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
    DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

def update_env_file(supabase_url: str = None, supabase_key: str = None, database_url: str = None, gemini_key: str = None, openai_key: str = None):
    reload_config()
    config_dict = {
        "PORT": str(PORT),
        "SUPABASE_URL": SUPABASE_URL,
        "SUPABASE_KEY": SUPABASE_KEY,
        "DATABASE_URL": DATABASE_URL,
        "GEMINI_API_KEY": GEMINI_API_KEY,
        "OPENAI_API_KEY": OPENAI_API_KEY
    }
    if supabase_url is not None:
        config_dict["SUPABASE_URL"] = supabase_url.strip()
    if supabase_key is not None:
        config_dict["SUPABASE_KEY"] = supabase_key.strip()
    if database_url is not None:
        config_dict["DATABASE_URL"] = database_url.strip()
    if gemini_key is not None:
        config_dict["GEMINI_API_KEY"] = gemini_key.strip()
    if openai_key is not None:
        config_dict["OPENAI_API_KEY"] = openai_key.strip()

    with open(ENV_PATH, "w", encoding="utf-8") as f:
        for k, v in config_dict.items():
            f.write(f"{k}={v}\n")
            
    reload_config()

def is_supabase_configured() -> bool:
    return bool(
        (SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL.startswith("http")) or
        (DATABASE_URL and DATABASE_URL.startswith("postgres"))
    )

