/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate GST number format (Indian GST)
 */
export const isValidGST = (gst: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

/**
 * Validate phone number format (Indian)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format (alphanumeric, underscore, hyphen, 3-30 chars)
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Validate embedding array format
 */
export const isValidEmbedding = (embedding: any): boolean => {
  if (!Array.isArray(embedding)) {
    return false;
  }

  if (embedding.length === 0) {
    return false;
  }

  // Check if all elements are numbers
  return embedding.every((val) => typeof val === 'number' && !isNaN(val));
};

/**
 * Sanitize input string
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate image URL (must be HTTPS and common image extension)
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!isValidUrl(url)) {
    return false;
  }

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const urlLower = url.toLowerCase();
  
  return (
    urlLower.startsWith('https://') &&
    imageExtensions.some((ext) => urlLower.includes(ext))
  );
};
