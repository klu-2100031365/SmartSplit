# SmartSplit Backend (FastAPI)

## Setup

1. Create a virtual environment
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables (example):

- `DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/smartsplit`
- `SECRET_KEY=change-me`
- `ACCESS_TOKEN_EXPIRE_MINUTES=10080`
- `CORS_ORIGINS=http://localhost:3000`

4. Run the server:

```bash
uvicorn app.main:app --reload --port 8000
```

The frontend should set:

- `NEXT_PUBLIC_API_URL=http://localhost:8000`
