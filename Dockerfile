# Этап сборки
FROM node:18-alpine AS build

WORKDIR /app

COPY . .

# Установим зависимости и соберём Vue-приложение
RUN npm install && npm run build

# Этап продакшн-сервера
FROM nginx:alpine

# Копируем готовый frontend в nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфиг Nginx (если нужно проксировать /api)
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80
