# Multi-stage build для оптимизации
FROM node:18-alpine as builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости (включая dev для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Production stage с nginx
FROM nginx:alpine as production

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Открываем порт
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Команда запуска
CMD ["nginx", "-g", "daemon off;"]
