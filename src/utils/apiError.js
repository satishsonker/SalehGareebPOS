/**
 * Map ASP.NET / JSON property names to typical React form field keys (camelCase).
 */
function toFormFieldKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return apiKey;
  if (apiKey.length > 1 && apiKey === apiKey.toUpperCase()) {
    return apiKey.toLowerCase();
  }
  return apiKey.charAt(0).toLowerCase() + apiKey.slice(1);
}

/**
 * Normalize ASP.NET Core ModelState dictionary: { "Name": ["msg"], ... }
 * @returns {Record<string, string>|null}
 */
export function parseApiValidationErrors(body) {
  if (!body || typeof body !== 'object' || !body.errors) return null;
  const raw = body.errors;
  if (typeof raw !== 'object' || Array.isArray(raw)) return null;

  const out = {};
  for (const [key, val] of Object.entries(raw)) {
    const fieldKey = toFormFieldKey(key);
    const messages = Array.isArray(val)
      ? val.map(String).filter(Boolean)
      : [String(val)].filter(Boolean);
    if (messages.length) {
      out[fieldKey] = messages.join(' ');
    }
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Human-readable message for notifications (Problem Details, validation, legacy shapes).
 */
export function formatApiErrorMessage(body, statusText, status) {
  const fallback =
    status != null
      ? `Request failed (${status}${statusText ? ` ${statusText}` : ''})`.trim()
      : 'Request failed';

  if (body == null) return fallback;

  if (typeof body === 'string') {
    const t = body.trim();
    return t ? t.slice(0, 500) : fallback;
  }

  if (typeof body !== 'object') return fallback;

  if (typeof body.detail === 'string' && body.detail.trim()) {
    return body.detail.trim();
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message.trim();
  }

  const validation = parseApiValidationErrors(body);
  if (validation) {
    const parts = [...new Set(Object.values(validation).filter(Boolean))];
    if (parts.length) return parts.join(' ');
  }

  if (Array.isArray(body.errors)) {
    const joined = body.errors.map(String).filter(Boolean).join(' ');
    if (joined) return joined;
  }

  if (typeof body.title === 'string' && body.title.trim()) {
    return body.title.trim();
  }

  return fallback;
}

/**
 * Merge server field errors into local form error state (e.g. after CRUD failure).
 */
export function mergeValidationErrorsFromApi(error, setFormErrors) {
  if (error?.validationErrors && typeof setFormErrors === 'function') {
    setFormErrors((prev) => ({ ...prev, ...error.validationErrors }));
  }
}
