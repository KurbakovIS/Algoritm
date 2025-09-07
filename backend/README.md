# Gamified Roadmap Platform Backend

Backend API для платформы геймифицированного обучения разработчиков.

## Технологии

- **FastAPI** - современный веб-фреймворк для Python
- **SQLAlchemy** - ORM для работы с базой данных
- **PostgreSQL** - основная база данных (SQLite для разработки)
- **Pydantic** - валидация данных
- **bcrypt** - безопасное хеширование паролей
- **JWT** - аутентификация

## Установка

### Требования

- Python 3.11+
- Poetry (для управления зависимостями)

### Установка Poetry

```bash
# macOS/Linux
curl -sSL https://install.python-poetry.org | python3 -

# Windows
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -

# Или через pip
pip install poetry
```

### Установка зависимостей

```bash
# Клонирование репозитория
git clone <repository-url>
cd backend

# Установка зависимостей
poetry install

# Активация виртуального окружения
poetry shell
```

### Альтернативная установка (без Poetry)

```bash
# Создание виртуального окружения
python -m venv venv
source venv/bin/activate  # Linux/macOS
# или
venv\Scripts\activate  # Windows

# Установка зависимостей
pip install -r requirements.txt
```

## Запуск

### Разработка

```bash
# С Poetry
poetry run uvicorn app.main:app --reload

# Или с Makefile
make start

# Или напрямую
uvicorn app.main:app --reload
```

### Продакшен

```bash
# С Poetry
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000

# Или с Makefile
make start-prod
```

## API Документация

После запуска сервера документация доступна по адресам:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Тестирование

```bash
# Запуск всех тестов
poetry run pytest

# Запуск с покрытием
poetry run pytest --cov=app

# Или с Makefile
make test
make test-cov
```

## Разработка

### Команды Makefile

```bash
make help          # Показать все доступные команды
make install       # Установить production зависимости
make install-dev   # Установить все зависимости
make test          # Запустить тесты
make test-cov      # Запустить тесты с покрытием
make format        # Форматировать код
make lint          # Проверить код
make clean         # Очистить кэш и временные файлы
make start         # Запустить dev сервер
make start-prod    # Запустить production сервер
make setup         # Настроить dev окружение
make check         # Запустить все проверки
```

### Форматирование кода

```bash
# Автоматическое форматирование
poetry run black app tests
poetry run isort app tests

# Или с Makefile
make format
```

### Проверка типов

```bash
# Проверка типов с mypy
poetry run mypy app

# Или с Makefile
make lint
```

### Pre-commit hooks

```bash
# Установка pre-commit hooks
poetry run pre-commit install

# Или с Makefile
make setup

# Запуск hooks вручную
poetry run pre-commit run --all-files
```

## Структура проекта

```
backend/
├── app/                    # Основной код приложения
│   ├── __init__.py
│   ├── main.py            # Точка входа FastAPI
│   ├── auth.py            # Аутентификация
│   ├── crud.py            # CRUD операции
│   ├── db.py              # База данных
│   ├── deps.py            # Зависимости
│   ├── models.py          # SQLAlchemy модели
│   ├── schemas.py         # Pydantic схемы
│   ├── settings.py        # Настройки
│   ├── seed.py            # Начальные данные
│   └── routers/           # API роуты
│       ├── auth.py
│       ├── roadmap.py
│       └── progress.py
├── tests/                 # Тесты
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_roadmap.py
│   └── test_progress.py
├── pyproject.toml         # Конфигурация Poetry
├── poetry.lock           # Заблокированные версии
├── Makefile              # Команды разработки
├── .pre-commit-config.yaml # Pre-commit hooks
├── .gitignore            # Git ignore
├── pytest.ini           # Конфигурация pytest
└── README.md             # Документация
```

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# База данных
DATABASE_URL=sqlite:///./dev.db
# Для PostgreSQL: postgresql://user:password@localhost/dbname

# JWT
JWT_SECRET=your-secret-key-here
JWT_ALG=HS256
JWT_EXP_SECONDS=86400

# Пароли
PWD_SALT=your-salt-here
```

## API Endpoints

### Аутентификация
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `GET /auth/me` - Профиль пользователя

### Роадмап
- `GET /roadmap/` - Все узлы роадмапа
- `GET /roadmap/directions` - Список направлений
- `GET /roadmap/directions/{direction}` - Узлы по направлению
- `GET /roadmap/node/{id}` - Детали узла

### Прогресс
- `POST /progress/update` - Обновить прогресс
- `GET /progress/mine` - Прогресс пользователя

## Тестовые пользователи

После запуска приложения создаются тестовые пользователи:

- `junior@dev.com` / `password123` - 150 XP, 1 бейдж
- `middle@dev.com` / `password123` - 450 XP, 2 бейджа
- `senior@dev.com` / `password123` - 850 XP, 3 бейджа
- `lead@dev.com` / `password123` - 1200 XP, 4 бейджа

## Развертывание

### Docker (рекомендуется)

```bash
# Сборка образа
docker build -t gamified-roadmap-backend .

# Запуск контейнера
docker run -p 8000:8000 gamified-roadmap-backend
```

### Heroku

```bash
# Установка Heroku CLI
# Создание приложения
heroku create your-app-name

# Настройка переменных окружения
heroku config:set DATABASE_URL=postgresql://...
heroku config:set JWT_SECRET=your-secret

# Развертывание
git push heroku main
```

## Лицензия

MIT License
