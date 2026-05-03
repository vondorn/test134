# Инструкция по запуску

## 1. Запуск инфраструктуры

Для поднятия контейнеров Producer, Consumer, RabbitMQ и Redis в корне проекта ввести команду:

```bash
docker compose up
```

## 2. Тестирование

Все команды запускаются из корневой папки каждого сервиса (`producer` / `consumer`).

- **Unit-тесты:**
  ```bash
  npm test
  ```
- **E2E-тесты (Интеграционные):**
  ```bash
  npm run test:e2e
  ```
- **Отчет о покрытии (Coverage):**
  ```bash
  npm run test:cov
  ```

## 3. Документация (Swagger)

API-документация доступна по адресу:
**[http://localhost:3002/api/docs](http://localhost:3002/api/docs)**

## 4. Проверка вручную

- отправить команду `/start` боту `@bot134431bot` в Telegram.
- вставить `id` чата в файл `consumer/.env` в переменную `TG_CHAT_ID`
- на странице документации либо через Postman отправить POST-запрос на `http://localhost:3002/api/orders`
- пример body:
  ```
  {
      "message": "текст"
  }
  ```
- сообщение придет в Telegram от бота
