/**
 * Unified Response Helper (Extreme DRY)
 * Ensures every API response follows the identical secure envelope.
 */

export function sendSuccess(res, data = null, message = 'تمت العملية بنجاح', statusCode = 200, meta = null) {
  const payload = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

export function sendError(res, message = 'حدث خطأ في النظام', statusCode = 500, errors = null) {
  const payload = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
}
