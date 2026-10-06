from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from supabase import create_client, Client
from .settings import SUPABASE_URL,SUPABASE_KEY

login_manager = LoginManager()
db = SQLAlchemy()


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None