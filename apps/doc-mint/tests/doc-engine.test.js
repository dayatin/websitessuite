import assert from "node:assert/strict";
import test from "node:test";
import {
  DOC_TEMPLATES,
  calculateATSScore,
  calculateInvoice,
  formatCurrency,
  renderResumeMarkdown,
} from "../src/lib/doc-engine.ts";

test("DOC_TEMPLATES metadata catalog integrity", () => {
  assert.equal(DOC_TEMPLATES.length, 6);
  for (const tmpl of DOC_TEMPLATES) {
    assert.ok(tmpl.slug.length > 0);
    assert.ok(tmpl.title.length > 0);
    assert.ok(["invoice", "resume", "receipt", "order"].includes(tmpl.type));
    assert.ok(tmpl.badge.length > 0);
    assert.ok(tmpl.icon.length > 0);
    assert.ok(tmpl.description.length > 0);
    assert.ok(tmpl.features.length >= 3);
  }
});

test("formatCurrency handles diverse international currencies correctly", () => {
  assert.equal(formatCurrency(1250, "USD"), "$1,250.00");
  assert.equal(formatCurrency(999.5, "EUR"), "€999.50");
  assert.equal(formatCurrency(450.75, "GBP"), "£450.75");
  assert.equal(formatCurrency(15000, "JPY"), "¥15,000.00");
  assert.equal(formatCurrency(75000, "INR"), "₹75,000.00");
});

test("calculateInvoice computes item subtotals, taxes, discounts, and grand totals", () => {
  const items = [
    {
      description: "Frontend Architecture",
      quantity: 40,
      unitPrice: 100,
      taxPercent: 10,
      discountPercent: 5,
    }, // Subtotal: 4000, Disc: 200, Taxable: 3800, Tax: 380, Total: 4180
    {
      description: "Cloud Infrastructure Setup",
      quantity: 1,
      unitPrice: 1500,
      taxPercent: 0,
      discountPercent: 0,
    }, // Subtotal: 1500, Disc: 0, Taxable: 1500, Tax: 0, Total: 1500
  ];

  const invoice = calculateInvoice(items, 0, "USD");
  assert.equal(invoice.subtotal, 5500);
  assert.equal(invoice.totalDiscount, 200);
  assert.equal(invoice.totalTax, 380);
  assert.equal(invoice.grandTotal, 5680);
  assert.equal(invoice.lineItems.length, 2);
  assert.equal(invoice.lineItems[0].lineTotal, 4180);
  assert.equal(invoice.lineItems[1].lineTotal, 1500);
});

test("calculateATSScore awards high score for comprehensive tech resume", () => {
  const strongResume = {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "+1-555-019-2834",
    location: "San Francisco, CA",
    summary:
      "Senior Full-Stack Systems Architect with 8+ years experience scaling high-concurrency microservices, Astro SSG websites, and Cloudflare distributed edge architectures.",
    skills: [
      "TypeScript",
      "Node.js",
      "Astro",
      "Cloudflare Workers",
      "PostgreSQL",
      "Docker",
      "Turborepo",
      "Web Crypto",
    ],
    experience: [
      {
        company: "Starlight Tech Inc",
        title: "Staff Software Engineer",
        location: "Remote",
        startDate: "2023",
        endDate: "Present",
        bullets: [
          "Architected zero-CLS static website suite handling 2M+ monthly active users",
          "Scaled edge caching reducing origin compute latency by 72%",
        ],
      },
      {
        company: "CloudScale Labs",
        title: "Senior Backend Engineer",
        location: "San Francisco, CA",
        startDate: "2020",
        endDate: "2023",
        bullets: [
          "Engineered distributed queuing pipeline processing 50k events/sec",
          "Optimized relational query execution reducing database load by 45%",
        ],
      },
    ],
    education: [
      {
        institution: "University of California, Berkeley",
        degree: "B.S. in Computer Science",
        year: "2020",
      },
    ],
  };

  const result = calculateATSScore(strongResume);
  assert.ok(result.percentage >= 85);
  assert.equal(result.rating, "Excellent");
  assert.equal(result.recommendations.length, 0);
});

test("calculateATSScore identifies gaps in sparse resume", () => {
  const weakResume = {
    fullName: "A",
    email: "invalid-email",
    phone: "123",
    location: "",
    summary: "",
    skills: ["Coding"],
    experience: [],
    education: [],
  };

  const result = calculateATSScore(weakResume);
  assert.ok(result.percentage < 50);
  assert.equal(result.rating, "Needs Improvement");
  assert.ok(result.recommendations.length >= 4);
});

test("renderResumeMarkdown serializes structured resume into clean markdown", () => {
  const resume = {
    fullName: "Taylor Morgan",
    email: "taylor@example.com",
    phone: "+1-555-1234",
    location: "Austin, TX",
    summary: "DevOps Engineer specializing in Kubernetes and cloud reliability.",
    skills: ["Kubernetes", "Terraform", "AWS", "CI/CD"],
    experience: [
      {
        company: "Apex Cloud",
        title: "DevOps Specialist",
        location: "Austin, TX",
        startDate: "2021",
        endDate: "Present",
        bullets: ["Automated infrastructure deployments with Terraform"],
      },
    ],
    education: [
      {
        institution: "UT Austin",
        degree: "B.S. in Information Systems",
        year: "2021",
      },
    ],
  };

  const md = renderResumeMarkdown(resume);
  assert.ok(md.includes("# Taylor Morgan"));
  assert.ok(md.includes("## Professional Summary"));
  assert.ok(md.includes("## Core Skills"));
  assert.ok(md.includes("Kubernetes • Terraform • AWS • CI/CD"));
  assert.ok(md.includes("## Professional Experience"));
  assert.ok(md.includes("### DevOps Specialist — Apex Cloud"));
});
