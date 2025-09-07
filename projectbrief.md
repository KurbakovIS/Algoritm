# Project Brief: Gamified Roadmap Platform MVP

## Обзор проекта
**Название:** Gamified Roadmap Platform — MVP  
**Тип:** Веб-платформа для геймифицированного обучения разработчиков  
**Статус:** В разработке (MVP)

## Технический стек
### Backend
- **Framework:** FastAPI 0.116.1
- **Database:** SQLAlchemy 2.0.31 + PostgreSQL (SQLite для разработки)
- **Authentication:** JWT токены
- **Server:** Uvicorn 0.30.1

### Frontend  
- **Framework:** React 18.3.1 + TypeScript
- **Build Tool:** Vite 5.3.3
- **Styling:** Tailwind CSS 3.4.4
- **State Management:** React Context API

## Архитектура
### Backend структура
```
backend/app/
├── main.py          # FastAPI приложение
├── models.py        # SQLAlchemy модели
├── schemas.py       # Pydantic схемы
├── auth.py          # Аутентификация
├── crud.py          # CRUD операции
├── db.py            # База данных
├── deps.py          # Зависимости
├── settings.py      # Настройки
├── seed.py          # Начальные данные
└── routers/         # API роуты
    ├── auth.py      # Аутентификация
    ├── roadmap.py   # Роадмапы
    └── progress.py  # Прогресс
```

### Frontend структура
```
frontend/src/
├── App.tsx          # Главный компонент
├── main.tsx         # Точка входа
├── store.tsx        # State management
├── api.ts           # API клиент
├── styles.css       # Глобальные стили
├── pages/           # Страницы
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Roadmap.tsx
│   └── Topic.tsx
└── components/      # Компоненты
    ├── VisualRoadmap.tsx
    ├── NodeCard.tsx
    ├── Chest.tsx
    ├── Avatar.tsx
    └── ...
```

## Основные сущности
### User (Пользователь)
- email, password_hash, role
- xp (очки опыта), badges (бейджи)
- Связь с Progress

### RoadmapNode (Узел роадмапа)
- direction (направление), title, description
- resources (ресурсы), checkpoint (чекпоинт)
- Связи many-to-many между узлами

### Progress (Прогресс)
- user_id, node_id, status, score
- Статусы: not_started, in_progress, completed

## API Endpoints
- `POST /auth/register` — регистрация
- `POST /auth/login` — вход
- `GET /auth/me` — профиль
- `GET /roadmap/directions` — направления
- `GET /roadmap/{direction}` — узлы по направлению
- `GET /roadmap/node/{id}` — детали узла
- `POST /progress/update` — обновить прогресс
- `GET /progress/mine` — прогресс пользователя

## Игровые механики
- **XP система:** Очки опыта за выполнение задач
- **Бейджи:** Пороговые награды (100, 300, 600, 1000 XP)
- **Роли:** intern, junior, middle, senior
- **Визуальные элементы:** Сундучки, 3D карточки, анимации

## Текущий статус
- ✅ Базовая архитектура настроена
- ✅ Модели данных созданы
- ✅ API endpoints реализованы
- ✅ Frontend компоненты созданы
- ✅ Аутентификация работает
- ✅ Роадмап система функционирует
- ✅ Прогресс трекинг реализован
