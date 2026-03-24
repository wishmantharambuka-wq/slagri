// utils/validators.js  —  Input validation helpers

/**
 * Returns an array of error strings, or empty array if valid.
 */

const validateSubmission = (body) => {
  const errors = [];
  if (!body.farmerName || body.farmerName.trim().length < 2)
    errors.push("farmerName is required (min 2 characters).");
  if (!body.crop || body.crop.trim().length < 2)
    errors.push("crop is required.");
  if (!body.quantity || isNaN(parseFloat(body.quantity)) || parseFloat(body.quantity) <= 0)
    errors.push("quantity must be a positive number.");
  if (!body.district || body.district.trim().length < 2)
    errors.push("district is required.");
  return errors;
};

const validateListing = (body) => {
  const errors = [];
  if (!body.crop || body.crop.trim().length < 2)
    errors.push("crop is required.");
  if (!body.quantity || isNaN(parseFloat(body.quantity)) || parseFloat(body.quantity) <= 0)
    errors.push("quantity must be a positive number.");
  if (!body.price || isNaN(parseFloat(body.price)) || parseFloat(body.price) <= 0)
    errors.push("price must be a positive number.");
  return errors;
};

const validateAlert = (body) => {
  const errors = [];
  if (!body.title || body.title.trim().length < 2)
    errors.push("title is required.");
  const validSeverities = ["info", "warning", "critical"];
  if (body.severity && !validSeverities.includes(body.severity))
    errors.push(`severity must be one of: ${validSeverities.join(", ")}.`);
  return errors;
};

const validateRegister = (body) => {
  const errors = [];
  if (!body.name || body.name.trim().length < 2)
    errors.push("name is required (min 2 characters).");
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    errors.push("A valid email address is required.");
  if (!body.password || body.password.length < 6)
    errors.push("password must be at least 6 characters.");
  const validRoles = ["farmer", "customer", "admin"];
  if (body.role && !validRoles.includes(body.role))
    errors.push(`role must be one of: ${validRoles.join(", ")}.`);
  return errors;
};

module.exports = {
  validateSubmission,
  validateListing,
  validateAlert,
  validateRegister,
};
