exports.handler = async (event) => {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const data = JSON.parse(event.body);

  const text = `
🎉 Новый RSVP

Имя: ${data.name}
Гостей: ${data.count}
Статус: ${data.status}
Комментарий: ${data.comment || '-'}
`;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text
    })
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };
};
