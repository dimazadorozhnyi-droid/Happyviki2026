FULL LUXURY INVITATION — TELEGRAM RSVP

Что сделано:
- Убран Story Mode
- Убран Print / PDF mode
- Изображение приглашения подключено в сайт
- Реальная отправка RSVP идет через Netlify Function в Telegram
- Токен бота не хранится во фронтенде

Как включить Telegram:
1. Создай Telegram-бота через BotFather
2. Получи TELEGRAM_BOT_TOKEN
3. Узнай TELEGRAM_CHAT_ID:
   - добавь бота в нужный чат/личку
   - напиши боту любое сообщение
   - открой:
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   - найди chat.id
4. В Netlify Site configuration -> Environment variables добавь:
   TELEGRAM_BOT_TOKEN=...
   TELEGRAM_CHAT_ID=...
5. Задеплой сайт

Структура:
- index.html
- styles.css
- script.js
- IMG_0559.png
- netlify/functions/rsvp.js
- netlify.toml

Локально:
- frontend можно открыть как статику
- функция rsvp.js заработает после deploy в Netlify

Важно:
- кнопка "В Telegram" на сайте просто открывает share
- кнопка "Отправить RSVP" шлет данные в твоего Telegram-бота через серверную функцию
