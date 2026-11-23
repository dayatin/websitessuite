import assert from "node:assert/strict";
import test from "node:test";
import { scanUrl } from "../src/lib/safety-scanner.ts";

test("Safety Scanner detects and blocks SSRF private IP attempts", () => {
  const ssrf1 = scanUrl("http://localhost:8080/admin");
  assert.equal(ssrf1.verdict, "HIGH_RISK");
  assert.ok(ssrf1.flags.includes("SSRF_BLOCKED_PRIVATE_HOST"));

  const ssrf2 = scanUrl("http://127.0.0.1:3000/api");
  assert.equal(ssrf2.verdict, "HIGH_RISK");

  const ssrf3 = scanUrl("http://169.254.169.254/latest/meta-data/");
  assert.equal(ssrf3.verdict, "HIGH_RISK");

  const ssrf4 = scanUrl("http://192.168.1.1/router");
  assert.equal(ssrf4.verdict, "HIGH_RISK");
});

test("Safety Scanner blocks non-http/https protocols", () => {
  const fileProto = scanUrl("file:///etc/passwd");
  assert.equal(fileProto.verdict, "HIGH_RISK");
  assert.ok(fileProto.flags.includes("FORBIDDEN_PROTOCOL"));

  const jsProto = scanUrl("javascript:alert(1)");
  assert.equal(jsProto.verdict, "HIGH_RISK");
});

test("Safety Scanner passes benign verified websites", () => {
  const legit1 = scanUrl("https://en.wikipedia.org/wiki/Earth");
  assert.equal(legit1.verdict, "SAFE");
  assert.equal(legit1.riskScore, 0);

  const legit2 = scanUrl("https://github.com/google");
  assert.equal(legit2.verdict, "SAFE");
});

test("Safety Scanner flags suspicious heuristic indicators", () => {
  const suspicious = scanUrl("http://a.b.c.d.bank-verify.top/login-account");
  assert.ok(suspicious.riskScore >= 25);
  assert.ok(
    suspicious.flags.includes("EXCESSIVE_SUBDOMAINS") || suspicious.flags.includes("HIGH_RISK_TLD"),
  );
});
