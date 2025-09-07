# Dockerfile для backend с Poetry
FROM python:3.11-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Poetry
RUN pip install poetry==1.7.1

# Настраиваем Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

# Создаем пользователя для безопасности
RUN adduser --disabled-password --gecos '' appuser

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы Poetry
COPY pyproject.toml poetry.lock* ./

# Устанавливаем зависимости
RUN poetry install --only=main --no-dev && rm -rf $POETRY_CACHE_DIR

# Копируем код приложения
COPY --chown=appuser:appuser . .

# Переключаемся на пользователя appuser
USER appuser

# Открываем порт
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD poetry run python -c "import requests; requests.get('http://localhost:8000/')" || exit 1

# Команда запуска
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]