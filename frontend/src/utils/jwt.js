function base64UrlDecode(input) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const decoded = atob(padded);
  try {
    return decodeURIComponent(
      decoded
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
  } catch {
    return decoded;
  }
}

export function decodeJwt(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payloadJson = base64UrlDecode(parts[1]);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

export function isJwtExpired(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds >= payload.exp;
}
