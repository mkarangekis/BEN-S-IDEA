FROM python:3.11-slim

WORKDIR /app

COPY ml/requirements.txt ./ml/
RUN pip install --no-cache-dir -r ml/requirements.txt

COPY ml ./ml

WORKDIR /app/ml

EXPOSE 8001

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
