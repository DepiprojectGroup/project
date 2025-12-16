# Multi-stage build using Alpine
FROM python:3.9-slim AS builder

WORKDIR /usr/src/app

# Install build dependencies and clean up in same layer
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final stage
FROM python:3.9-slim

WORKDIR /usr/src/app

# Copy only the installed packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY main.py config.py model.py ./

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000

ENV FLASK_APP=main.py
ENV FLASK_ENV=production
ENV PORT=8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()"

CMD ["python", "main.py"]