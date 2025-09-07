# Docker Setup для Gamified Roadmap Platform

## 🚀 Быстрый старт

### Разработка
```bash
# Запуск в режиме разработки
make dev

# Или напрямую
docker-compose -f docker-compose.dev.yml up -d --build
```

### Продакшен
```bash
# Запуск в продакшене
make prod

# Или напрямую
docker-compose up -d --build
```

## 📋 Доступные команды

### Основные команды
- `make dev` - Запуск в режиме разработки
- `make prod` - Запуск в продакшене
- `make stop` - Остановка всех сервисов
- `make restart` - Перезапуск

### Логи
- `make logs` - Показать все логи
- `make logs-backend` - Логи backend
- `make logs-frontend` - Логи frontend
- `make logs-db` - Логи базы данных

### База данных
- `make db-reset` - Сброс базы данных (⚠️ удаляет все данные!)
- `make db-backup` - Создание бэкапа

### Очистка
- `make clean` - Очистка всех Docker ресурсов
- `make clean-images` - Удаление образов проекта

## 🏗️ Архитектура

### Сервисы
- **frontend** - React приложение с nginx
- **backend** - FastAPI приложение
- **db** - PostgreSQL 15
- **redis** - Redis для кэширования (опционально)

### Сети
- `roadmap-network` - Основная сеть для продакшена
- `roadmap-dev-network` - Сеть для разработки

### Volumes
- `postgres_data` - Данные PostgreSQL
- `redis_data` - Данные Redis

## 🔧 Конфигурация

### Переменные окружения

#### Backend
```env
DATABASE_URL=postgresql://postgres:password@db:5432/roadmap
JWT_SECRET=dev-secret-change-in-production
PWD_SALT=dev-salt-change-in-production
ENVIRONMENT=production
```

#### Frontend
```env
VITE_API_URL=http://localhost:8000
```

### Порты
- **80** - Frontend (nginx)
- **8000** - Backend API
- **5432** - PostgreSQL
- **6379** - Redis

## 🏥 Health Checks

Все сервисы имеют встроенные health checks:

- **Frontend**: `GET /health`
- **Backend**: `GET /`
- **Database**: `pg_isready`
- **Redis**: `redis-cli ping`

## 📊 Мониторинг

### Проверка статуса
```bash
make health
```

### Просмотр логов
```bash
# Все сервисы
make logs

# Конкретный сервис
make logs-backend
```

## 🐛 Отладка

### Подключение к контейнеру
```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec db psql -U postgres -d roadmap
```

### Просмотр логов
```bash
# Последние 100 строк
docker-compose logs --tail=100

# Следить за логами
docker-compose logs -f
```

## 🔒 Безопасность

### Production настройки
1. Измените `JWT_SECRET` и `PWD_SALT`
2. Используйте сильные пароли для базы данных
3. Настройте SSL/TLS для nginx
4. Ограничьте доступ к портам

### Пользователи
- Backend запускается от пользователя `appuser` (UID 1001)
- Frontend запускается от пользователя `nextjs` (UID 1001)

## 📈 Оптимизация

### Multi-stage builds
- **Builder stage** - Сборка зависимостей
- **Production stage** - Минимальный runtime образ

### Кэширование
- Docker layers кэшируются для быстрой пересборки
- nginx кэширует статические файлы
- Redis для кэширования API ответов

### Размер образов
- Backend: ~200MB (Python slim + dependencies)
- Frontend: ~50MB (nginx alpine + built assets)
- Database: ~200MB (PostgreSQL alpine)

## 🚀 Деплой

### Production деплой
```bash
# Сборка и запуск
make prod

# Проверка здоровья
make health

# Мониторинг логов
make logs
```

### CI/CD интеграция
```yaml
# Пример GitHub Actions
- name: Build and deploy
  run: |
    make prod
    make health
```

## 📝 Troubleshooting

### Частые проблемы

1. **Порт уже используется**
   ```bash
   # Проверить процессы
   lsof -i :8000
   
   # Остановить все контейнеры
   make clean
   ```

2. **База данных не запускается**
   ```bash
   # Проверить логи
   make logs-db
   
   # Сбросить данные
   make db-reset
   ```

3. **Frontend не подключается к backend**
   ```bash
   # Проверить сеть
   docker network ls
   
   # Проверить переменные окружения
   docker-compose exec frontend env
   ```

### Логи ошибок
```bash
# Все ошибки
docker-compose logs 2>&1 | grep -i error

# Конкретный сервис
docker-compose logs backend 2>&1 | grep -i error
```
