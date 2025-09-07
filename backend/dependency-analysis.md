# Анализ зависимостей для Poetry

## Текущие зависимости (requirements.txt)

### Основные зависимости (Runtime)
- `fastapi==0.116.1` - Web framework
- `uvicorn==0.30.1` - ASGI server
- `SQLAlchemy==2.0.31` - ORM
- `psycopg2-binary==2.9.9` - PostgreSQL adapter
- `python-multipart==0.0.9` - Form data parsing
- `pydantic[email]==2.8.2` - Data validation
- `python-dotenv==1.0.1` - Environment variables
- `bcrypt==4.1.2` - Password hashing

### Зависимости для разработки (Development)
- `pytest==7.4.3` - Testing framework
- `pytest-asyncio==0.21.1` - Async testing support
- `httpx==0.25.2` - HTTP client for tests

## Предлагаемая структура для Poetry

### Группа main (Runtime)
```toml
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.116.1"
uvicorn = "^0.30.1"
sqlalchemy = "^2.0.31"
psycopg2-binary = "^2.9.9"
python-multipart = "^0.0.9"
pydantic = {extras = ["email"], version = "^2.8.2"}
python-dotenv = "^1.0.1"
bcrypt = "^4.1.2"
```

### Группа dev (Development)
```toml
[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
pytest-asyncio = "^0.21.1"
httpx = "^0.25.2"
black = "^23.0.0"
isort = "^5.12.0"
mypy = "^1.5.0"
pre-commit = "^3.4.0"
```

### Группа test (Testing)
```toml
[tool.poetry.group.test.dependencies]
pytest-cov = "^4.1.0"
pytest-mock = "^3.11.0"
pytest-xdist = "^3.3.0"
```

## Дополнительные инструменты

### Code Quality
- **black** - Автоматическое форматирование кода
- **isort** - Сортировка импортов
- **mypy** - Статическая типизация
- **pre-commit** - Git hooks для качества кода

### Testing
- **pytest-cov** - Покрытие тестами
- **pytest-mock** - Мокирование
- **pytest-xdist** - Параллельное выполнение тестов

## Скрипты и команды

### Основные команды
```toml
[tool.poetry.scripts]
start = "uvicorn app.main:app --reload"
start-prod = "uvicorn app.main:app --host 0.0.0.0 --port 8000"
test = "pytest"
test-cov = "pytest --cov=app"
format = "black app tests"
lint = "isort app tests && mypy app"
```

## Конфигурация инструментов

### Black (Code formatting)
```toml
[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''
```

### isort (Import sorting)
```toml
[tool.isort]
profile = "black"
multi_line_output = 3
line_length = 88
known_first_party = ["app"]
```

### MyPy (Type checking)
```toml
[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true
```

### Pytest (Testing)
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "-v",
    "--tb=short",
    "--strict-markers",
    "--strict-config",
    "--cov=app",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-report=xml"
]
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks tests as integration tests",
    "unit: marks tests as unit tests"
]
```

## Миграционная стратегия

### Этап 1: Подготовка
1. Создать резервную копию requirements.txt
2. Установить Poetry (если не установлен)
3. Проанализировать зависимости на конфликты

### Этап 2: Создание pyproject.toml
1. Инициализировать Poetry проект
2. Настроить метаданные проекта
3. Добавить зависимости по группам

### Этап 3: Тестирование
1. Установить зависимости через Poetry
2. Запустить тесты
3. Проверить работоспособность приложения

### Этап 4: Обновление документации
1. Обновить README.md
2. Создать инструкции по установке
3. Обновить CI/CD конфигурацию

## Риски и митигация

### Потенциальные проблемы
- **Конфликты версий** - Poetry может обнаружить несовместимости
- **Изменение окружения** - Нужно пересоздать виртуальное окружение
- **Совместимость** - Некоторые инструменты могут не работать

### Стратегии митигации
- **Постепенная миграция** - Тестировать каждый шаг
- **Резервное копирование** - Сохранить requirements.txt
- **Команда** - Информировать команду о изменениях
- **Документация** - Обновить все инструкции
