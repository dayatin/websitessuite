/**
 * DocMint Studio Document Generation Engine
 * Professional client-side Invoices, ATS-friendly Resumes, and Commercial Receipts.
 */

export interface DocTemplateMeta {
  slug: string;
  title: string;
  type: "invoice" | "resume" | "receipt" | "order";
  icon: string;
  badge: string;
  description: string;
  features: string[];
}

export const DOC_TEMPLATES: DocTemplateMeta[] = [
  {
    slug: "freelance-invoice",
    title: "Freelance & Contractor Invoice",
    type: "invoice",
    icon: "💼",
    badge: "Most Used",
    description:
      "Itemized billing with hourly/fixed rates, multi-currency formatting, tax rates, and bank transfer instructions.",
    features: [
      "Calculates item totals, multi-tier taxes, and line discounts automatically",
      "Multi-currency support: USD ($), EUR (€), GBP (£), CAD ($), AUD ($), INR (₹)",
      "Print-optimized CSS matching standard ISO A4 and US Letter page boundaries",
    ],
  },
  {
    slug: "corporate-invoice",
    title: "Corporate Commercial Invoice",
    type: "invoice",
    icon: "🏢",
    badge: "B2B Standard",
    description:
      "Enterprise billing with PO numbers, tax registration numbers (VAT/GST/EIN), and Net 30 payment terms.",
    features: [
      "Dedicated fields for corporate entity registration and tax identifiers",
      "Payment terms calculator (Net 15, Net 30, Net 60, Due on Receipt)",
      "Formal corporate layout with header logo space and authorization line",
    ],
  },
  {
    slug: "software-engineer-resume",
    title: "Software Engineer & Tech Resume",
    type: "resume",
    icon: "💻",
    badge: "ATS High-Score",
    description:
      "Engineered specifically to parse flawlessly through Workday, Greenhouse, and Lever Applicant Tracking Systems.",
    features: [
      "Clean single-column chronological structure preferred by enterprise ATS algorithms",
      "Integrated real-time ATS compatibility score calculator and keyword validator",
      "Instant dual export: formatted PDF print layout and clean Markdown text",
    ],
  },
  {
    slug: "executive-resume",
    title: "Executive & Leadership Resume",
    type: "resume",
    icon: "👔",
    badge: "Executive",
    description:
      "Impact-driven layout emphasizing revenue growth, team scaling, governance, and board achievements.",
    features: [
      "High-impact executive summary and core competencies grid",
      "KPI & metric bullet prioritization (revenue, headcount, margins)",
      "Minimalist typography adhering to executive search firm standards",
    ],
  },
  {
    slug: "sales-receipt",
    title: "Retail & Service Transaction Receipt",
    type: "receipt",
    icon: "🧾",
    badge: "Point of Sale",
    description:
      "Proof of purchase documentation with transaction timestamp, payment method, and itemized subtotal.",
    features: [
      "Compact transaction receipt formatting for client reimbursements",
      "Logs payment method (Credit, Debit, Wire, Cash) and authorization code",
      "Printable receipt slips with zero clutter",
    ],
  },
  {
    slug: "purchase-order",
    title: "Standard Vendor Purchase Order",
    type: "order",
    icon: "📦",
    badge: "Procurement",
    description:
      "Formal procurement document detailing required goods, delivery timelines, and requisition approval.",
    features: [
      "Vendor and shipping destination address blocks",
      "FOB delivery terms and shipping method specifications",
      "Authorized requisition signature and date section",
    ],
  },
];

// --- 1. Invoice & Financial Math Engine ---

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent?: number;
  discountPercent?: number;
}

export interface InvoiceCalculationResult {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTax: string;
  formattedGrandTotal: string;
  currency: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    lineSubtotal: number;
    lineDiscount: number;
    lineTax: number;
    lineTotal: number;
    formattedTotal: string;
  }[];
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "$",
  AUD: "$",
  JPY: "¥",
  INR: "₹",
};

export function formatCurrency(amount: number, currency = "USD"): string {
  const symbol = CURRENCY_SYMBOLS[currency] || "$";
  const formattedNumber = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formattedNumber}`;
}

export function calculateInvoice(
  items: InvoiceLineItem[],
  overallDiscountPercent = 0,
  currency = "USD",
): InvoiceCalculationResult {
  let subtotal = 0;
  let totalLineDiscounts = 0;
  let totalLineTaxes = 0;

  const processedLines = items.map((item) => {
    const qty = Math.max(0, item.quantity);
    const unitPrice = Math.max(0, item.unitPrice);
    const lineSubtotal = Math.round(qty * unitPrice * 100) / 100;

    const discountRate = (item.discountPercent || 0) / 100;
    const lineDiscount = Math.round(lineSubtotal * discountRate * 100) / 100;

    const taxableAmount = Math.max(0, lineSubtotal - lineDiscount);
    const taxRate = (item.taxPercent || 0) / 100;
    const lineTax = Math.round(taxableAmount * taxRate * 100) / 100;

    const lineTotal = Math.round((taxableAmount + lineTax) * 100) / 100;

    subtotal += lineSubtotal;
    totalLineDiscounts += lineDiscount;
    totalLineTaxes += lineTax;

    return {
      description: item.description,
      quantity: qty,
      unitPrice,
      lineSubtotal,
      lineDiscount,
      lineTax,
      lineTotal,
      formattedTotal: formatCurrency(lineTotal, currency),
    };
  });

  const overallDiscountRate = Math.max(0, Math.min(100, overallDiscountPercent)) / 100;
  const overallDiscount =
    Math.round((subtotal - totalLineDiscounts) * overallDiscountRate * 100) / 100;
  const totalDiscount = Math.round((totalLineDiscounts + overallDiscount) * 100) / 100;

  const grandTotal = Math.round(Math.max(0, subtotal - totalDiscount + totalLineTaxes) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount,
    totalTax: Math.round(totalLineTaxes * 100) / 100,
    grandTotal,
    formattedSubtotal: formatCurrency(subtotal, currency),
    formattedDiscount: formatCurrency(totalDiscount, currency),
    formattedTax: formatCurrency(totalLineTaxes, currency),
    formattedGrandTotal: formatCurrency(grandTotal, currency),
    currency,
    lineItems: processedLines,
  };
}

// --- 2. ATS Resume Builder & Scoring Engine ---

export interface ResumeWorkExperience {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  year: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  summary: string;
  skills: string[];
  experience: ResumeWorkExperience[];
  education: ResumeEducation[];
  certifications?: string[];
}

export interface ATSScoringResult {
  score: number;
  maxScore: number;
  percentage: number;
  rating: "Excellent" | "Good" | "Needs Improvement";
  recommendations: string[];
}

export function calculateATSScore(resume: ResumeData): ATSScoringResult {
  let score = 0;
  const maxScore = 100;
  const recommendations: string[] = [];

  // 1. Contact Information Integrity (20 pts)
  if (resume.fullName && resume.fullName.trim().length > 2) {
    score += 5;
  } else {
    recommendations.push("Provide your full legal name at the top of your resume.");
  }

  if (resume.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.email)) {
    score += 5;
  } else {
    recommendations.push("Include a valid, professional email address.");
  }

  if (resume.phone && resume.phone.replace(/[^0-9]/g, "").length >= 7) {
    score += 5;
  } else {
    recommendations.push("Add a direct phone number formatted with country/area code.");
  }

  if (resume.location && resume.location.trim().length > 2) {
    score += 5;
  } else {
    recommendations.push(
      "Specify your general city and state/country location for regional ATS filtering.",
    );
  }

  // 2. Professional Summary (15 pts)
  if (resume.summary && resume.summary.length >= 80 && resume.summary.length <= 400) {
    score += 15;
  } else if (resume.summary && resume.summary.length > 0) {
    score += 8;
    recommendations.push("Keep your professional summary concise (between 80 and 400 characters).");
  } else {
    recommendations.push(
      "Add a targeted 2-3 sentence professional summary highlighting your core expertise.",
    );
  }

  // 3. Work Experience & Quantifiable Impact (35 pts)
  if (resume.experience && resume.experience.length >= 2) {
    score += 15;
  } else if (resume.experience && resume.experience.length === 1) {
    score += 10;
    recommendations.push(
      "Listing at least two chronological professional roles strengthens ATS depth scoring.",
    );
  } else {
    recommendations.push("Add your relevant professional work experience history.");
  }

  let totalBullets = 0;
  let actionOrientedBullets = 0;
  const actionVerbs = [
    "architected",
    "developed",
    "led",
    "engineered",
    "reduced",
    "scaled",
    "increased",
    "built",
    "designed",
    "optimized",
  ];

  if (resume.experience) {
    for (const exp of resume.experience) {
      if (exp.bullets) {
        totalBullets += exp.bullets.length;
        for (const b of exp.bullets) {
          const lower = b.toLowerCase();
          if (actionVerbs.some((v) => lower.includes(v))) {
            actionOrientedBullets++;
          }
        }
      }
    }
  }

  if (totalBullets >= 4) {
    score += 10;
  } else {
    recommendations.push("Include at least 2-4 achievement bullets per role.");
  }

  if (actionOrientedBullets >= 3) {
    score += 10;
  } else {
    recommendations.push(
      "Begin achievement bullets with strong action verbs (e.g. Architected, Scaled, Optimized, Reduced).",
    );
  }

  // 4. Skills Taxonomy (15 pts)
  if (resume.skills && resume.skills.length >= 6) {
    score += 15;
  } else if (resume.skills && resume.skills.length >= 3) {
    score += 8;
    recommendations.push(
      "Include at least 6-12 relevant technical/core skills for keyword matching.",
    );
  } else {
    recommendations.push("Add a dedicated skills section to match job posting keywords.");
  }

  // 5. Education (15 pts)
  if (resume.education && resume.education.length >= 1) {
    score += 15;
  } else {
    recommendations.push("Add your degree, diploma, or highest level of formal education.");
  }

  const percentage = Math.round((score / maxScore) * 100);
  let rating: ATSScoringResult["rating"] = "Needs Improvement";

  if (percentage >= 85) {
    rating = "Excellent";
  } else if (percentage >= 65) {
    rating = "Good";
  }

  return {
    score,
    maxScore,
    percentage,
    rating,
    recommendations,
  };
}

export function renderResumeMarkdown(resume: ResumeData): string {
  const parts: string[] = [];

  parts.push(`# ${resume.fullName}`);
  parts.push(`${resume.email} | ${resume.phone} | ${resume.location}`);
  if (resume.linkedin || resume.github) {
    const links = [resume.linkedin, resume.github].filter(Boolean);
    parts.push(links.join(" | "));
  }
  parts.push("");

  if (resume.summary) {
    parts.push("## Professional Summary");
    parts.push(resume.summary);
    parts.push("");
  }

  if (resume.skills && resume.skills.length > 0) {
    parts.push("## Core Skills");
    parts.push(resume.skills.join(" • "));
    parts.push("");
  }

  if (resume.experience && resume.experience.length > 0) {
    parts.push("## Professional Experience");
    for (const exp of resume.experience) {
      parts.push(`### ${exp.title} — ${exp.company}`);
      parts.push(`*${exp.startDate} - ${exp.endDate} | ${exp.location}*`);
      for (const bullet of exp.bullets) {
        parts.push(`- ${bullet}`);
      }
      parts.push("");
    }
  }

  if (resume.education && resume.education.length > 0) {
    parts.push("## Education");
    for (const edu of resume.education) {
      parts.push(`- **${edu.degree}**, ${edu.institution} (${edu.year})`);
    }
    parts.push("");
  }

  return parts.join("\n");
}
