const EVENT_DATE = new Date("2026-05-01T16:00:00+03:00");
const STORAGE_KEY = "happyviki-rsvp-draft-v2";

const form = document.getElementById("rsvpForm");
const statusBox = document.getElementById("formStatus");
const preview = document.getElementById("messagePreview");
const submitBtn = document.getElementById("submitBtn");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const resetBtn = document.getElementById("resetBtn");
const copyMessageBtn = document.getElementById("copyMessage");

const fields = {
  guestName: document.getElementById("guestName"),
  contact: document.getElementById("contact"),
  guestCount: document.getElementById("guestCount"),
  attendance: document.getElementById("attendance"),
  comment: document.getElementById("comment"),
  company: document.getElementById("company")
};

function updateCountdown() {
  const diff = EVENT_DATE.getTime() - Date.now();
  const safeDiff = Math.max(diff, 0);

  const days = Math.floor(safeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safeDiff / (1000 * 60)) % 60);
  const seconds = Math.floor((safeDiff / 1000) % 60);

  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFormData() {
  return {
    guestName: fields.guestName.value.trim(),
    contact: fields.contact.value.trim(),
    guestCount: fields.guestCount.value,
    attendance: fields.attendance.value,
    comment: fields.comment.value.trim(),
    company: fields.company.value.trim()
  };
}

function buildMessage(data) {
  return [
    "🎉 Новое подтверждение RSVP",
    "",
    `Имя: ${data.guestName || "—"}`,
    `Контакт: ${data.contact || "—"}`,
    `Количество гостей: ${data.guestCount || "—"}`,
    `Статус: ${data.attendance || "—"}`,
    `Комментарий: ${data.comment || "—"}`,
    "",
    `Источник: ${window.location.origin}`,
    `Время отправки: ${new Date().toLocaleString("ru-RU")}`
  ].join("\n");
}

function renderPreview() {
  preview.textContent = buildMessage(getFormData());
}

function setStatus(message, tone = "info") {
  statusBox.dataset.tone = tone;
  statusBox.style.display = "block";
  statusBox.innerHTML = escapeHtml(message).replaceAll("\n", "<br>");
}

function clearStatus() {
  statusBox.removeAttribute("data-tone");
  statusBox.style.display = "none";
  statusBox.textContent = "";
}

function markInvalid(name, message) {
  const field = form.querySelector(`[name="${name}"]`)?.closest(".field");
  const error = form.querySelector(`[data-error-for="${name}"]`);

  if (field) field.dataset.invalid = "true";
  if (error) error.textContent = message;
}

function clearErrors() {
  form.querySelectorAll(".field").forEach((item) => {
    delete item.dataset.invalid;
  });

  form.querySelectorAll(".field-error").forEach((item) => {
    item.textContent = "";
  });
}

function validate() {
  clearErrors();
  const data = getFormData();
  let valid = true;

  if (!data.guestName || data.guestName.length < 2) {
    markInvalid("guestName", "Введите имя полностью");
    valid = false;
  }

  if (!data.contact || data.contact.length < 3) {
    markInvalid("contact", "Укажите телефон или @telegram");
    valid = false;
  }

  if (!data.guestCount) {
    markInvalid("guestCount", "Выберите количество гостей");
    valid = false;
  }

  if (!data.attendance) {
    markInvalid("attendance", "Выберите статус");
    valid = false;
  }

  if (data.comment.length > 500) {
    markInvalid("comment", "Комментарий слишком длинный");
    valid = false;
  }

  if (data.company) {
    setStatus("Похоже на автоматическую отправку. Попробуйте ещё раз.", "error");
    valid = false;
  }

  return valid;
}

function saveDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormData()));
  setStatus("Черновик сохранён на этом устройстве.", "success");
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);

    Object.entries(fields).forEach(([key, input]) => {
      if (key !== "company" && typeof data[key] === "string") {
        input.value = data[key];
      }
    });
  } catch (error) {
    console.error("Не удалось восстановить черновик", error);
  }
}

async function copyMessage() {
  try {
    await navigator.clipboard.writeText(preview.textContent);
    setStatus("Текст RSVP скопирован.", "success");
  } catch (error) {
    setStatus("Не удалось скопировать текст. Попробуйте вручную.", "error");
  }
}

function resetForm() {
  form.reset();
  localStorage.removeItem(STORAGE_KEY);
  clearErrors();
  clearStatus();
  renderPreview();
}

async function handleSubmit(event) {
  event.preventDefault();
  clearStatus();

  if (!validate()) {
    if (!statusBox.textContent.trim()) {
      setStatus("Пожалуйста, заполните обязательные поля.", "error");
    }
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Отправляем...";

  try {
    const response = await fetch("/.netlify/functions/rsvp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(getFormData())
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Не удалось отправить RSVP.");
    }

    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    renderPreview();
    setStatus("RSVP успешно отправлен. Спасибо за подтверждение участия ♥", "success");
  } catch (error) {
    setStatus(`Ошибка отправки: ${error.message}`, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Отправить RSVP в Telegram";
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

Object.values(fields).forEach((input) => {
  input.addEventListener("input", () => {
    renderPreview();
    clearErrors();
  });

  input.addEventListener("change", renderPreview);
});

saveDraftBtn.addEventListener("click", saveDraft);
resetBtn.addEventListener("click", resetForm);
copyMessageBtn.addEventListener("click", copyMessage);
form.addEventListener("submit", handleSubmit);

loadDraft();
renderPreview();
