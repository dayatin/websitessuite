/**
 * Phishing, Malware & SSRF Safety Scanner
 */

export type SafetyVerdict = "SAFE" | "SUSPICIOUS" | "HIGH_RISK";

export interface ScanResult {
  verdict: SafetyVerdict;
  riskScore: number; // 0 (safest) to 100 (dangerous)
  flags: string[];
  normalizedUrl: string;
  domain: string;
  protocol: string;
}

const FORBIDDEN_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254", // AWS/Cloud metadata service
  "metadata.google.internal",
]);

const SUSPICIOUS_TLDS = new Set([
  "zip",
  "mov",
  "xyz",
  "top",
  "work",
  "loan",
  "click",
  "country",
  "stream",
]);

/**
 * Validates a target URL against SSRF attacks and phishing heuristics.
 */
export function scanUrl(inputUrl: string): ScanResult {
  const flags: string[] = [];
  let riskScore = 0;

  let parsed: URL;
  try {
    parsed = new URL(inputUrl.trim());
  } catch {
    return {
      verdict: "HIGH_RISK",
      riskScore: 100,
      flags: ["MALFORMED_URL"],
      normalizedUrl: inputUrl,
      domain: "",
      protocol: "",
    };
  }

  // 1. Strict Protocol Enforcement
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      verdict: "HIGH_RISK",
      riskScore: 100,
      flags: ["FORBIDDEN_PROTOCOL"],
      normalizedUrl: parsed.href,
      domain: parsed.hostname,
      protocol: parsed.protocol,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. SSRF & Internal IP Protection
  if (FORBIDDEN_HOSTS.has(hostname) || isPrivateIP(hostname)) {
    return {
      verdict: "HIGH_RISK",
      riskScore: 100,
      flags: ["SSRF_BLOCKED_PRIVATE_HOST"],
      normalizedUrl: parsed.href,
      domain: hostname,
      protocol: parsed.protocol,
    };
  }

  // 3. Phishing Heuristics
  // Flag IP address used as hostname directly
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    riskScore += 40;
    flags.push("RAW_IP_HOSTNAME");
  }

  // Flag excessive subdomains
  const parts = hostname.split(".");
  if (parts.length > 4) {
    riskScore += 25;
    flags.push("EXCESSIVE_SUBDOMAINS");
  }

  // Flag suspicious TLD
  const tld = parts[parts.length - 1];
  if (SUSPICIOUS_TLDS.has(tld)) {
    riskScore += 20;
    flags.push("HIGH_RISK_TLD");
  }

  // Flag suspicious keywords in path or query
  const fullText = (parsed.pathname + parsed.search).toLowerCase();
  if (
    fullText.includes("login") ||
    fullText.includes("verify") ||
    fullText.includes("banking") ||
    fullText.includes("password")
  ) {
    if (parsed.protocol !== "https:") {
      riskScore += 50;
      flags.push("INSECURE_AUTH_KEYWORD");
    } else {
      riskScore += 15;
      flags.push("SENSITIVE_AUTH_KEYWORD");
    }
  }

  let verdict: SafetyVerdict = "SAFE";
  if (riskScore >= 60) {
    verdict = "HIGH_RISK";
  } else if (riskScore >= 25) {
    verdict = "SUSPICIOUS";
  }

  return {
    verdict,
    riskScore: Math.min(100, riskScore),
    flags,
    normalizedUrl: parsed.href,
    domain: hostname,
    protocol: parsed.protocol,
  };
}

function isPrivateIP(host: string): boolean {
  if (host.startsWith("10.") || host.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
}
