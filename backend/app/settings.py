from dotenv import load_dotenv
import os

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

DATABASE_URL = (
    f"dbname={DB_NAME} "
    f"user={DB_USER} "
    f"password={DB_PASSWORD} "
    f"host={DB_HOST} "
    f"port={DB_PORT}"
)
