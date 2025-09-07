# Dockerfile для backend с pip
FROM python:3.11-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Создаем пользователя для безопасности
RUN adduser --disabled-password --gecos '' appuser

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY pyproject.toml ./

# Устанавливаем зависимости напрямую через pip
RUN pip install --no-cache-dir \
    fastapi==0.116.1 \
    uvicorn==0.30.1 \
    sqlalchemy==2.0.31 \
    psycopg2-binary==2.9.9 \
    alembic==1.13.0 \
    python-multipart==0.0.9 \
    click==8.1.0 \
    "pydantic[email]==2.8.2" \
    pydantic-settings==2.0.0 \
    python-dotenv==1.0.1 \
    bcrypt==4.1.2

# Копируем код приложения
COPY --chown=appuser:appuser . .

# Переключаемся на пользователя appuser
USER appuser

# Открываем порт
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Команда запуска
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]