// utils/response.js  —  Standard API response helpers
// ======================================================
// All controllers use these so every response has the same shape.

const ok = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success : true,
    message,
    data,
  });
};

const created = (res, data, message = "Created") => {
  return ok(res, data, message, 201);
};

const fail = (res, message = "Bad request", statusCode = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const notFound = (res, message = "Not found") => {
  return fail(res, message, 404);
};

const unauthorized = (res, message = "Unauthorized") => {
  return fail(res, message, 401);
};

const forbidden = (res, message = "Forbidden — insufficient permissions") => {
  return fail(res, message, 403);
};

const serverError = (res, message = "Internal server error") => {
  return fail(res, message, 500);
};

module.exports = { ok, created, fail, notFound, unauthorized, forbidden, serverError };
