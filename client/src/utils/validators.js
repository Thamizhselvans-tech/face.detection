export const isEmpty = (v) => !v || !String(v).trim();

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const isStrongPassword = (v) => v && v.length >= 6;

export const isValidRegNum = (v) => /^[A-Za-z0-9]{4,20}$/.test(v);

export const isSupportedImage = (file) =>
  file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);

export const isUnderSizeLimit = (file, maxMB = 5) =>
  file && file.size <= maxMB * 1024 * 1024;

// ── Registration form ─────────────────────────────────────────────────
export const validateRegisterStep1 = (fields) => {
  const errors = {};
  if (isEmpty(fields.name))
    errors.name = 'Full name is required.';
  else if (fields.name.trim().length < 3)
    errors.name = 'Name must be at least 3 characters.';

  if (isEmpty(fields.registerNumber))
    errors.registerNumber = 'Register number is required.';
  else if (!isValidRegNum(fields.registerNumber))
    errors.registerNumber = 'Use 4-20 alphanumeric characters.';

  if (isEmpty(fields.department))
    errors.department = 'Please select your department.';

  if (isEmpty(fields.email))
    errors.email = 'Email address is required.';
  else if (!isEmail(fields.email))
    errors.email = 'Enter a valid email address.';

  return errors;
};

export const validateRegisterStep2 = (fields, faceImage) => {
  const errors = {};
  if (isEmpty(fields.password))
    errors.password = 'Password is required.';
  else if (!isStrongPassword(fields.password))
    errors.password = 'Password must be at least 6 characters.';

  if (isEmpty(fields.confirmPassword))
    errors.confirmPassword = 'Please confirm your password.';
  else if (fields.password !== fields.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.';

  if (!faceImage)
    errors.faceImage = 'Please upload your face photo.';
  else if (!isSupportedImage(faceImage))
    errors.faceImage = 'Supported formats: JPEG, PNG, WEBP.';
  else if (!isUnderSizeLimit(faceImage))
    errors.faceImage = 'Image must be under 5 MB.';

  return errors;
};

// ── Login form ────────────────────────────────────────────────────────
export const validateLogin = (fields) => {
  const errors = {};
  if (isEmpty(fields.email))
    errors.email = 'Email is required.';
  else if (!isEmail(fields.email))
    errors.email = 'Enter a valid email address.';

  if (isEmpty(fields.password))
    errors.password = 'Password is required.';

  return errors;
};
