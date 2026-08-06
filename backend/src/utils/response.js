export function success(res, message = 'Success', data = {}) {
  return res.json({ success: true, message, data });
}

export function error(res, status = 400, message = 'Error', errors = []) {
  return res.status(status).json({ success: false, message, errors });
}
