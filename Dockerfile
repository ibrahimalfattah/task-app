FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir flask kubernetes
COPY logshot-lite.py /app/logshot_k8s.py
CMD ["python", "/app/logshot_k8s.py"]
