# HappyViki RSVP Upgrade

## Что внутри
- `index.html`
- `styles.css`
- `script.js`
- `netlify/functions/rsvp.js`
- `netlify.toml`

## Что нужно настроить в Netlify
Добавьте переменные окружения:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Как узнать TELEGRAM_CHAT_ID
1. Создайте бота через `@BotFather`
2. Напишите боту любое сообщение
3. Откройте:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. Найдите `chat.id`

## Деплой
1. Загрузите проект в Netlify
2. Добавьте environment variables
3. Redeploy site

## Что делает форма
- валидирует обязательные поля
- показывает preview сообщения
- сохраняет черновик в localStorage
- отправляет RSVP через серверную функцию в Telegram
