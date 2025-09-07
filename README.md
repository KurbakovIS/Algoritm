Gamified Roadmap Platform — MVP

Стек
- Backend: FastAPI + SQLAlchemy (PostgreSQL; для быстрого старта есть SQLite)
- Frontend: React + Vite + Tailwind

Переменные окружения (.env)
- Backend: см. `backend/.env.example` (скопируйте в `backend/.env` и при необходимости измените)
- Frontend: см. `frontend/.env.example` (скопируйте в `frontend/.env`)

Запуск Backend
1) Установите зависимости (Python 3.11+):
   - Создайте venv и установите пакеты из `backend/requirements.txt`.
2) Настройте переменные окружения (опционально):
   - Используйте файл `backend/.env` (автоматически подхватывается через python-dotenv)
   - По умолчанию SQLite (`DATABASE_URL=sqlite:///./dev.db`), `JWT_SECRET`, `PWD_SALT` заданы в `.env`.
3) Запустите сервер:
   - `uvicorn app.main:app --reload` (из директории `backend`)

Базовые эндпойнты
- `POST /auth/register` — регистрация (email, password, role)
- `POST /auth/login` — логин, возвращает access_token
- `GET /auth/me` — профиль пользователя
- `GET /roadmap/directions` — список направлений
- `GET /roadmap/{direction}` — узлы карты по направлению
- `GET /roadmap/node/{id}` — деталь узла
- `POST /progress/update` — обновить статус/очки по теме (добавляет XP/бейджи)
- `GET /progress/mine` — прогресс пользователя

Запуск Frontend
1) Перейдите в `frontend`
2) Установите зависимости: `npm i` или `pnpm i`
3) Запустите: `npm run dev`
   - Браузер: http://localhost:5173
   - Переменные берутся из `frontend/.env` (`VITE_API_URL=http://localhost:8000`)

Игровой UX и визуал
- Сундучки (выбор направления), физические панели, 3D-карточки тем.
- Анимации: pop, shimmer, rumble; псевдо-текстуры (дерево/латунь) через градиенты.
- Награды: XP и бейджи (пороговые: 100, 300, 600, 1000).

Поток MVP
1) Регистрация/вход.
2) ЛК: приветствие, роль, XP, бейджи, сундуки направлений.
3) Карта: визуальные карточки узлов.
4) Тема: описание, ресурсы, мини-тест (очки), отметка выполнено → XP/бейдж.

Структура
- `backend/app` — FastAPI приложение, модели, роуты, сидер.
- `frontend/src` — React, страницы и компоненты (Chest, NodeCard, RoadmapMap).

Примечание
- Для продакшена замените упрощённый парольный хэш и JWT на полноценные решения (bcrypt/argon2, PyJWT/JOSE, refresh-токены), добавьте миграции (Alembic) и реальные текстуры/ассеты.
