from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

try:
    engine = create_engine(settings.database_url, pool_pre_ping=True)
except ModuleNotFoundError as e:
    if str(e) == "No module named 'psycopg'":
        raise RuntimeError(
            "Database driver 'psycopg' is not installed. Install backend dependencies: pip install -r requirements.txt"
        ) from e
    raise
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
