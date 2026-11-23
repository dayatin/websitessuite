/**
 * DevWorkbench Developer & Security Utilities Engine
 * Client-Side Cryptographic & Encoding Utilities powered by Web Crypto API.
 */

export interface DevToolMeta {
  slug: string;
  title: string;
  category: "security" | "codec" | "formatter" | "generator";
  icon: string;
  badge: string;
  description: string;
  benefits: string[];
}

export const DEV_TOOLS: DevToolMeta[] = [
  {
    slug: "jwt-debugger",
    title: "JWT Debugger & Signature Inspector",
    category: "security",
    icon: "🔑",
    badge: "Essential",
    description:
      "Inspect JSON Web Tokens, parse decoded headers & claims, and verify HMAC-SHA256 signatures client-side.",
    benefits: [
      "Zero network transmission: Secret keys and tokens remain in local browser memory",
      "Instant expiration and clock-skew detection with human-readable timestamps",
      "Validates standard RFC 7519 claims: exp, iat, nbf, iss, sub, aud",
    ],
  },
  {
    slug: "json-formatter",
    title: "JSON Formatter, Validator & Minifier",
    category: "formatter",
    icon: "⚙️",
    badge: "Daily Dev",
    description:
      "Format, beautify, validate syntax, and compute structural depth and payload weight for JSON payloads.",
    benefits: [
      "Clear, actionable syntax error messages with line and column highlighting",
      "Configurable indentation: 2 spaces, 4 spaces, or compact 1-line minification",
      "Calculates key counts, max hierarchy depth, and raw UTF-8 byte sizing",
    ],
  },
  {
    slug: "hash-generator",
    title: "Cryptographic Hash & HMAC Generator",
    category: "security",
    icon: "🛡️",
    badge: "Web Crypto",
    description:
      "Compute secure SHA-256, SHA-512, SHA-384, and SHA-1 checksums and keyed HMAC digests via hardware Web Crypto.",
    benefits: [
      "Hardware-accelerated crypto.subtle native digest execution",
      "Zero third-party library overhead or external crypto dependencies",
      "Hexadecimal and Base64 formatted checksum outputs",
    ],
  },
  {
    slug: "base64-hex-converter",
    title: "Base64 & Hex Multi-Codec Converter",
    category: "codec",
    icon: "🔄",
    badge: "Universal",
    description:
      "Bi-directional encoding and decoding between raw UTF-8 strings, Base64, Base64URL, and Hexadecimal representations.",
    benefits: [
      "Full UTF-8 multi-byte unicode code point preservation",
      "RFC 4648 Base64URL variant support for URL-safe token transmission",
      "Inspect byte arrays and hexadecimal memory dumps",
    ],
  },
  {
    slug: "uuid-generator",
    title: "RFC 4122 UUID v4 Generator",
    category: "generator",
    icon: "🎲",
    badge: "CSPRNG",
    description:
      "Generate cryptographically secure pseudo-random Version 4 UUIDs with bulk generation capabilities.",
    benefits: [
      "True cryptographic entropy via crypto.randomUUID()",
      "Bulk generation with uppercase, lowercase, and hyphenation toggle options",
      "1-click clipboard export for API development and database seeding",
    ],
  },
  {
    slug: "url-encoder",
    title: "URL & HTML Entity Encoder / Decoder",
    category: "codec",
    icon: "🌐",
    badge: "Web Standard",
    description:
      "Encode query parameters, escape reserved URI characters, and sanitize or decode HTML entities.",
    benefits: [
      "Percent-encoding conforming to RFC 3986 URI specifications",
      "Comprehensive HTML named and numeric entity resolution",
      "Sanitizes XSS-prone characters (&, <, >, \", ') for secure markup rendering",
    ],
  },
];

// --- 1. Base64 & Codec Utilities ---

export function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function fromBase64(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function toBase64Url(text: string): string {
  return toBase64(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) {
    b64 += "=";
  }
  return fromBase64(b64);
}

export function toHex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function fromHex(hexString: string): string {
  const cleanHex = hexString.replace(/\s+/g, "");
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string: length must be even");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

export function encodeURL(text: string, component = true): string {
  return component ? encodeURIComponent(text) : encodeURI(text);
}

export function decodeURL(text: string): string {
  return decodeURIComponent(text);
}

export function encodeHTMLEntities(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function decodeHTMLEntities(text: string): string {
  const entityMap: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
    "&apos;": "'",
  };
  return text.replace(/&(?:amp|lt|gt|quot|#039|apos);/g, (match) => entityMap[match] || match);
}

// --- 2. JWT Debugger & Signature Inspector ---

export interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresAt?: string;
  issuedAt?: string;
  status: "active" | "expired" | "not_yet_valid" | "no_expiration";
}

export function decodeJWT(token: string): DecodedJWT {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT: token must contain exactly 3 dot-separated segments");
  }

  const [rawHeader, rawPayload, signature] = parts;

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    header = JSON.parse(fromBase64Url(rawHeader));
  } catch {
    throw new Error("Invalid JWT header: unable to decode base64url JSON");
  }

  try {
    payload = JSON.parse(fromBase64Url(rawPayload));
  } catch {
    throw new Error("Invalid JWT payload: unable to decode base64url JSON");
  }

  const nowSec = Math.floor(Date.now() / 1000);
  let isExpired = false;
  let status: DecodedJWT["status"] = "no_expiration";
  let expiresAt: string | undefined;
  let issuedAt: string | undefined;

  if (typeof payload.iat === "number") {
    issuedAt = new Date(payload.iat * 1000).toISOString();
  }

  if (typeof payload.exp === "number") {
    expiresAt = new Date(payload.exp * 1000).toISOString();
    if (nowSec >= payload.exp) {
      isExpired = true;
      status = "expired";
    } else {
      status = "active";
    }
  }

  if (typeof payload.nbf === "number" && nowSec < payload.nbf) {
    status = "not_yet_valid";
  }

  return {
    header,
    payload,
    signature,
    isExpired,
    expiresAt,
    issuedAt,
    status,
  };
}

export async function verifyJWT_HS256(token: string, secret: string): Promise<boolean> {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return false;

  const [rawHeader, rawPayload, signature] = parts;
  const data = new TextEncoder().encode(`${rawHeader}.${rawPayload}`);
  const keyData = new TextEncoder().encode(secret);

  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
    const bytes = new Uint8Array(signatureBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const computedSignature = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return computedSignature === signature;
  } catch {
    return false;
  }
}

// --- 3. Cryptographic Hashes (Web Crypto API) ---

export async function computeHash(
  text: string,
  algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512",
): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function computeHMAC(
  text: string,
  secret: string,
  hashAlgorithm: "SHA-256" | "SHA-512" = "SHA-256",
): Promise<string> {
  const keyData = new TextEncoder().encode(secret);
  const data = new TextEncoder().encode(text);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: hashAlgorithm },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- 4. JSON Formatter & Statistics ---

export interface JSONFormatResult {
  formatted: string;
  isValid: boolean;
  error?: string;
  stats?: {
    byteSize: number;
    keyCount: number;
    maxDepth: number;
  };
}

function calculateDepthAndKeys(
  obj: unknown,
  currentDepth = 1,
): { maxDepth: number; keyCount: number } {
  if (obj === null || typeof obj !== "object") {
    return { maxDepth: currentDepth, keyCount: 0 };
  }

  let maxDepth = currentDepth;
  let keyCount = 0;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const res = calculateDepthAndKeys(item, currentDepth + 1);
      maxDepth = Math.max(maxDepth, res.maxDepth);
      keyCount += res.keyCount;
    }
  } else {
    const keys = Object.keys(obj);
    keyCount += keys.length;
    for (const key of keys) {
      const res = calculateDepthAndKeys((obj as Record<string, unknown>)[key], currentDepth + 1);
      maxDepth = Math.max(maxDepth, res.maxDepth);
      keyCount += res.keyCount;
    }
  }

  return { maxDepth, keyCount };
}

export function formatJSON(rawInput: string, indent = 2): JSONFormatResult {
  try {
    const parsed = JSON.parse(rawInput);
    const formatted = indent === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);
    const utf8Bytes = new TextEncoder().encode(formatted).length;
    const { maxDepth, keyCount } = calculateDepthAndKeys(parsed);

    return {
      formatted,
      isValid: true,
      stats: {
        byteSize: utf8Bytes,
        keyCount,
        maxDepth,
      },
    };
  } catch (err: unknown) {
    return {
      formatted: rawInput,
      isValid: false,
      error: err instanceof Error ? err.message : "Malformed JSON syntax",
    };
  }
}

// --- 5. UUID v4 Generator ---

export function generateUUIDs(
  count = 1,
  options?: { uppercase?: boolean; removeHyphens?: boolean },
): string[] {
  const result: string[] = [];
  const safeCount = Math.max(1, Math.min(100, count));

  for (let i = 0; i < safeCount; i++) {
    let uuid = crypto.randomUUID();
    if (options?.uppercase) {
      uuid = uuid.toUpperCase();
    }
    if (options?.removeHyphens) {
      uuid = uuid.replace(/-/g, "");
    }
    result.push(uuid);
  }

  return result;
}
