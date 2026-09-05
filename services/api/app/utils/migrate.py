import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    print("Migrations are SQL files in supabase/migrations/")
    print("Apply using: supabase db reset")
    print("Or apply via Supabase Dashboard SQL Editor")

if __name__ == "__main__":
    migrate()
