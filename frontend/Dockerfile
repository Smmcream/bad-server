FROM node:22-alpine as build
WORKDIR /app/frontend
COPY package*.json ./
# ✅ Заменяем npm ci на npm install (не требует package-lock.json)
RUN npm install
COPY . .
RUN npm run build

# Этап для продакшна (если нужен)
FROM node:22-alpine as production
WORKDIR /app/frontend
# Копируем собранные файлы из этапа build
COPY --from=build /app/frontend/dist ./dist
# Устанавливаем простой сервер для статики
RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]