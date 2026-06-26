export interface DecodedJwtPayload {
  exp?: number;
  [claim: string]: unknown;
}

export function decodeJwtPayload(token: string): DecodedJwtPayload {
  const payload = token.split(".")[1];

  if (!payload) {
    return {};
  }

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decodedPayload = Buffer.from(normalizedPayload, "base64").toString("utf8");

  return JSON.parse(decodedPayload) as DecodedJwtPayload;
}

export function getJwtExpiresAt(token: string) {
  try {
    const payload = decodeJwtPayload(token);

    if (typeof payload.exp !== "number") {
      return null;
    }

    return new Date(payload.exp * 1000).toISOString();
  } catch {
    return null;
  }
}

