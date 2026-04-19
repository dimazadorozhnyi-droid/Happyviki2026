exports.handler = async (event) => {
  const json = (statusCode, payload) => ({
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  });

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method Not Allowed" });
  }

  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return json(500, {
        ok: false,
        error: "Не заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в Netlify environment variables."
      });
    }

    const body = JSON.parse(event.body || "{}");

    const guestName = String(body.guestName || "").trim();
    const contact = String(body.contact || "").trim();
    const guestCount = String(body.guestCount || "").trim();
    const attendance = String(body.attendance || "").trim();
    const comment = String(body.comment || "").trim();
    const company = String(body.company || "").trim();

    if (company) {
      return json(400, { ok: false, error: "Spam detected" });
    }

    if (!guestName || guestName.length < 2) {
      return json(400, { ok: false, error: "Укажите корректное имя." });
    }

    if (!contact || contact.length < 3) {
      return json(400, { ok: false, error: "Укажите телефон или Telegram." });
    }

    if (!guestCount) {
      return json(400, { ok: false, error: "Укажите количество гостей." });
    }

    if (!attendance) {
      return json(400, { ok: false, error: "Укажите статус участия." });
    }

    if (comment.length > 500) {
      return json(400, { ok: false, error: "Комментарий слишком длинный." });
    }

    const forwardedFor = event.headers["x-forwarded-for"] || event.headers["client-ip"] || "unknown";
    const userAgent = event.headers["user-agent"] || "unknown";
    const siteUrl = event.headers["origin"] || event.headers["referer"] || "unknown";

    const message = [
      "🎉 <b>Новое подтверждение RSVP</b>",
      "",
      `<b>Имя:</b> ${escapeHtml(guestName)}`,
      `<b>Контакт:</b> ${escapeHtml(contact)}`,
      `<b>Количество гостей:</b> ${escapeHtml(guestCount)}`,
      `<b>Статус:</b> ${escapeHtml(attendance)}`,
      `<b>Комментарий:</b> ${escapeHtml(comment || "—")}`,
      "",
      `<b>Источник:</b> ${escapeHtml(siteUrl)}`,
      `<b>IP:</b> ${escapeHtml(forwardedFor)}`,
      `<b>User-Agent:</b> ${escapeHtml(userAgent.slice(0, 250))}`,
      `<b>Время:</b> ${escapeHtml(new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }))}`
    ].join("\n");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
          disable_web_page_preview: true
        })
      }
    );

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramResult.ok) {
      return json(502, {
        ok: false,
        error: "Telegram API вернул ошибку.",
        details: telegramResult
      });
    }

    return json(200, { ok: true });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
