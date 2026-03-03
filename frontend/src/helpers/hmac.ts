import { v4 as uuidv4 } from "uuid";

const HMAC_SECRET = import.meta.env.VITE_HMAC_SECRET as string;

const getSecretKey = async (): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(HMAC_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
};

const generateSignature = async (payload: string): Promise<string> => {
  const encoder = new TextEncoder();
  const key = await getSecretKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const buildHmacHeaders = async (
  method: string,
  url: string,
  body: string
): Promise<Record<string, string>> => {
  const timestamp = Date.now().toString();
  const nonce = uuidv4();
  const payload = `${timestamp}.${method}.${url}.${body}`;
  const signature = await generateSignature(payload);
  return {
    "Content-Type": "application/json",
    "x-timestamp": timestamp,
    "x-nonce": nonce,
    "x-signature": signature,
  };
};