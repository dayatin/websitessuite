/**
 * PrivacyShield Check Privacy & Security Audit Engine
 * Browser fingerprinting entropy, device permissions inspection, and HTTP security header evaluation.
 */

export interface ShieldToolMeta {
  slug: string;
  title: string;
  category: "fingerprint" | "permissions" | "network" | "headers";
  icon: string;
  badge: string;
  description: string;
  features: string[];
}

export const SHIELD_TOOLS: ShieldToolMeta[] = [
  {
    slug: "browser-fingerprint-test",
    title: "Browser Fingerprint & Uniqueness Test",
    category: "fingerprint",
    icon: "🛡️",
    badge: "Core Audit",
    description:
      "Measure your browser's canvas, audio, and hardware entropy to determine how easily tracking companies can identify you without cookies.",
    features: [
      "Evaluates Canvas 2D and WebGL rendering entropy without storing data",
      "Calculates total identifying bits of entropy across 12 hardware vectors",
      "Provides concrete browser hardening recommendations (Tor, Brave, Firefox)",
    ],
  },
  {
    slug: "permissions-auditor",
    title: "Hardware & Sensor Permissions Inspector",
    category: "permissions",
    icon: "🔒",
    badge: "Sensor Privacy",
    description:
      "Audit which websites have access to your webcam, microphone, precise GPS geolocation, and clipboard.",
    features: [
      "Real-time query via standard navigator.permissions API",
      "Categorizes permissions into High, Medium, and Low security risk levels",
      "Step-by-step instructions to revoke lingering permissions on Chrome, Safari, and Edge",
    ],
  },
  {
    slug: "webrtc-leak-test",
    title: "WebRTC Local IP Leak Detection Tool",
    category: "network",
    icon: "🌐",
    badge: "Network Security",
    description:
      "Detect whether WebRTC STUN candidate requests expose your real local or public IP address while using a VPN.",
    features: [
      "Client-side RTCPeerConnection candidate inspection",
      "Identifies IPv4 and IPv6 leaks bypassing VPN tunnels",
      "Provides browser flag settings to disable WebRTC candidate broadcasting",
    ],
  },
  {
    slug: "security-headers-checker",
    title: "HTTP Security Headers & CSP Evaluator",
    category: "headers",
    icon: "📋",
    badge: "Enterprise Web",
    description:
      "Analyze website response headers for HSTS, Content Security Policy (CSP), X-Frame-Options, and Permissions-Policy.",
    features: [
      "Evaluates compliance against modern OWASP Secure Headers Project standards",
      "Identifies clickjacking, XSS injection, and insecure transport vulnerabilities",
      "Outputs ready-to-deploy Cloudflare _headers and Nginx configuration snippets",
    ],
  },
  {
    slug: "tracker-block-test",
    title: "Tracker & Third-Party Shield Test",
    category: "network",
    icon: "🚫",
    badge: "AdBlock Audit",
    description:
      "Verify if your browser or adblocking extensions successfully neutralize invasive cross-site tracking scripts.",
    features: [
      "Simulates benign telemetry beacon calls to popular tracking endpoints",
      "Tests effectiveness of uBlock Origin, Privacy Badger, and native browser shields",
      "Scores tracker-blocking efficiency out of 100",
    ],
  },
  {
    slug: "do-not-track-inspector",
    title: "Global Privacy Control (GPC) & DNT Inspector",
    category: "fingerprint",
    icon: "⚙️",
    badge: "Legal Compliance",
    description:
      "Verify that your browser transmits legally binding Global Privacy Control (GPC) signals under CCPA/CPRA and GDPR.",
    features: [
      "Inspects navigator.globalPrivacyControl and navigator.doNotTrack attributes",
      "Validates CCPA Section 1798.135 opt-out of sale legal requirements",
      "Guides activation of GPC across Chromium and Gecko browsers",
    ],
  },
];

// --- 1. Permissions Audit Engine ---

export interface PermissionDefinition {
  name: string;
  category: "hardware" | "location" | "storage" | "data";
  risk: "high" | "medium" | "low";
  description: string;
  recommendation: string;
}

export const STANDARD_PERMISSIONS: PermissionDefinition[] = [
  {
    name: "camera",
    category: "hardware",
    risk: "high",
    description: "Grants access to video input streams from built-in or external webcams.",
    recommendation:
      "Allow only on trusted conferencing domains; keep default state set to 'Ask Every Time'.",
  },
  {
    name: "microphone",
    category: "hardware",
    risk: "high",
    description: "Grants continuous audio capture access from microphones.",
    recommendation: "Revoke when not on active calls to prevent covert audio monitoring.",
  },
  {
    name: "geolocation",
    category: "location",
    risk: "high",
    description: "Provides high-precision physical GPS and Wi-Fi triangulated coordinates.",
    recommendation:
      "Deny by default; provide manual zip codes or city names instead of raw coordinates.",
  },
  {
    name: "notifications",
    category: "data",
    risk: "medium",
    description: "Allows websites to push background desktop alerts and modal notifications.",
    recommendation:
      "Deny on non-essential news and e-commerce websites to reduce phishing and spam.",
  },
  {
    name: "clipboard-read",
    category: "data",
    risk: "medium",
    description:
      "Enables websites to inspect copied passwords, credit cards, or private text in your clipboard.",
    recommendation: "Strictly restrict to dedicated developer tooling or document editing suites.",
  },
  {
    name: "persistent-storage",
    category: "storage",
    risk: "low",
    description:
      "Prevents browser from clearing local Cache and IndexedDB under low disk space conditions.",
    recommendation: "Safe for progressive web apps (PWAs) requiring offline local functionality.",
  },
];

// --- 2. Fingerprinting & Entropy Analysis ---

export interface EntropyFactorsInput {
  screenRes?: string;
  timezone?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  canvasHash?: string;
  audioHash?: string;
  userAgent?: string;
  language?: string;
}

export interface FingerprintRiskResult {
  overallScore: number; // 0 (Low uniqueness / high privacy) to 100 (Extremely unique / easily tracked)
  riskRating: "Low" | "Medium" | "High";
  entropyBits: number;
  uniquenessRatio: string;
  recommendations: string[];
}

export function calculateFingerprintRisk(factors: EntropyFactorsInput): FingerprintRiskResult {
  let entropyBits = 0;
  const recommendations: string[] = [];

  // 1. Canvas / WebGL fingerprint (high entropy ~8-12 bits)
  if (factors.canvasHash && factors.canvasHash.length > 0) {
    entropyBits += 9.5;
  } else {
    entropyBits += 3.0; // Blocked or randomized canvas reduces uniqueness
  }

  // 2. AudioContext fingerprint (~5-8 bits)
  if (factors.audioHash && factors.audioHash.length > 0) {
    entropyBits += 6.5;
  }

  // 3. Screen Resolution (~4-6 bits)
  if (factors.screenRes) {
    if (["1920x1080", "1366x768", "1440x900"].includes(factors.screenRes)) {
      entropyBits += 3.0; // Common resolution
    } else {
      entropyBits += 5.5; // Rare multi-monitor or retina setup
      recommendations.push(
        "Avoid maximizing browser windows across multi-monitor setups to prevent unique viewport identification.",
      );
    }
  }

  // 4. Hardware Concurrency & Memory (~3-5 bits)
  if (factors.hardwareConcurrency && factors.hardwareConcurrency > 16) {
    entropyBits += 4.0;
    recommendations.push(
      "High CPU thread counts (>16 cores) significantly narrow down your unique device fingerprint.",
    );
  } else {
    entropyBits += 2.0;
  }

  if (factors.deviceMemory && factors.deviceMemory >= 16) {
    entropyBits += 2.5;
  }

  // 5. Timezone & Language (~4-6 bits)
  if (factors.timezone) {
    entropyBits += 3.5;
  }
  if (factors.language && factors.language !== "en-US") {
    entropyBits += 3.0;
  }

  // Normalize entropy bits to 0-100 scale (33 bits is theoretically unique among entire human population: 2^33 ~ 8.5 billion)
  const normalizedScore = Math.min(100, Math.round((entropyBits / 33) * 100));

  let riskRating: FingerprintRiskResult["riskRating"] = "Low";
  if (normalizedScore >= 70) {
    riskRating = "High";
  } else if (normalizedScore >= 40) {
    riskRating = "Medium";
  }

  if (riskRating === "High") {
    recommendations.push(
      "Enable privacy protection shields (such as Brave Shields, Firefox Enhanced Tracking Protection, or Mullvad Browser) to standardize canvas and audio output.",
    );
  }

  const uniquenessRatio = `1 in ${Math.round(2 ** entropyBits).toLocaleString("en-US")} browsers`;

  return {
    overallScore: normalizedScore,
    riskRating,
    entropyBits: Math.round(entropyBits * 10) / 10,
    uniquenessRatio,
    recommendations,
  };
}

// --- 3. HTTP Security Headers Audit ---

export interface SecurityHeaderDefinition {
  header: string;
  recommendedValue: string;
  importance: "critical" | "high" | "medium";
  description: string;
}

export const SECURITY_HEADERS: SecurityHeaderDefinition[] = [
  {
    header: "Strict-Transport-Security",
    recommendedValue: "max-age=31536000; includeSubDomains; preload",
    importance: "critical",
    description:
      "Forces browsers to exclusively establish encrypted HTTPS connections, preventing SSL-stripping attacks.",
  },
  {
    header: "Content-Security-Policy",
    recommendedValue: "default-src 'self'",
    importance: "critical",
    description:
      "Restricts script, stylesheet, and font origins, preventing Cross-Site Scripting (XSS) and data injection.",
  },
  {
    header: "X-Frame-Options",
    recommendedValue: "DENY",
    importance: "high",
    description:
      "Prevents websites from being embedded within malicious iframes, eliminating clickjacking vulnerabilities.",
  },
  {
    header: "X-Content-Type-Options",
    recommendedValue: "nosniff",
    importance: "high",
    description:
      "Prevents browsers from MIME-type sniffing executable scripts disguised as images or text.",
  },
  {
    header: "Referrer-Policy",
    recommendedValue: "strict-origin-when-cross-origin",
    importance: "medium",
    description:
      "Prevents sensitive URL path parameters and query strings from leaking to external referrers.",
  },
  {
    header: "Permissions-Policy",
    recommendedValue: "camera=(), microphone=(), geolocation=()",
    importance: "medium",
    description:
      "Disables unnecessary browser hardware features from being invoked by third-party scripts.",
  },
];

export interface HeaderEvaluationResult {
  score: number;
  maxScore: number;
  passingCount: number;
  failingCount: number;
  grade: "A+" | "A" | "B" | "C" | "F";
  results: {
    header: string;
    status: "pass" | "fail";
    currentValue?: string;
    recommendedValue: string;
    description: string;
  }[];
}

export function evaluateSecurityHeaders(headers: Record<string, string>): HeaderEvaluationResult {
  let score = 0;
  const maxScore = 100;
  let passingCount = 0;
  let failingCount = 0;

  // Normalized lowercase lookup map
  const normalized: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    normalized[k.toLowerCase()] = v;
  }

  const results = SECURITY_HEADERS.map((def) => {
    const val = normalized[def.header.toLowerCase()];
    const isPresent = val !== undefined && val.trim().length > 0;

    let points = 0;
    if (def.importance === "critical") points = 25;
    else if (def.importance === "high") points = 15;
    else points = 10;

    if (isPresent) {
      score += points;
      passingCount++;
      return {
        header: def.header,
        status: "pass" as const,
        currentValue: val,
        recommendedValue: def.recommendedValue,
        description: def.description,
      };
    }

    failingCount++;
    return {
      header: def.header,
      status: "fail" as const,
      recommendedValue: def.recommendedValue,
      description: def.description,
    };
  });

  let grade: HeaderEvaluationResult["grade"] = "F";
  if (score >= 90) grade = "A+";
  else if (score >= 80) grade = "A";
  else if (score >= 65) grade = "B";
  else if (score >= 45) grade = "C";

  return {
    score,
    maxScore,
    passingCount,
    failingCount,
    grade,
    results,
  };
}

// --- 4. Global Privacy Control (GPC) & DNT ---

export function auditDoNotTrack(
  dntHeader?: string | null,
  gpcHeader?: string | boolean | null,
): { dntEnabled: boolean; gpcEnabled: boolean; privacyProtected: boolean; advice: string } {
  const dntEnabled = dntHeader === "1" || dntHeader === "yes";
  const gpcEnabled = gpcHeader === "1" || gpcHeader === true;

  const privacyProtected = dntEnabled || gpcEnabled;

  let advice =
    "Your browser is not broadcasting legal privacy opt-out signals. Consider enabling Global Privacy Control.";
  if (gpcEnabled) {
    advice =
      "Global Privacy Control (GPC) signal is active. Covered websites under CCPA/GDPR are legally required to respect your opt-out of data sale.";
  } else if (dntEnabled) {
    advice =
      "Do Not Track (DNT) is enabled, but DNT is voluntary. Enable Global Privacy Control (GPC) for enforceable legal privacy protection.";
  }

  return {
    dntEnabled,
    gpcEnabled,
    privacyProtected,
    advice,
  };
}
