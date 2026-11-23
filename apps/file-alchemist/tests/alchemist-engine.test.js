import assert from "node:assert/strict";
import test from "node:test";
import {
  CONVERSION_TOOLS,
  csvToJSON,
  csvToMarkdownTable,
  detectDelimiter,
  generateWAVFromPCM,
  jsonToCSV,
  parseCSV,
  parseDataURL,
  parseWAVHeader,
  toDataURL,
} from "../src/lib/alchemist-engine.ts";

test("CONVERSION_TOOLS metadata catalog integrity", () => {
  assert.equal(CONVERSION_TOOLS.length, 6);
  for (const tool of CONVERSION_TOOLS) {
    assert.ok(tool.slug.length > 0);
    assert.ok(tool.title.length > 0);
    assert.ok(["data", "audio", "graphics"].includes(tool.category));
    assert.ok(tool.badge.length > 0);
    assert.ok(tool.icon.length > 0);
    assert.ok(tool.description.length > 0);
    assert.ok(tool.benefits.length >= 3);
  }
});

test("detectDelimiter identifies comma, tab, semicolon and pipe delimiters", () => {
  assert.equal(detectDelimiter("name,age,city\nAlice,30,NY"), ",");
  assert.equal(detectDelimiter("name\tage\tcity\nBob\t25\tLondon"), "\t");
  assert.equal(detectDelimiter("name;age;city\nCharlie;40;Paris"), ";");
  assert.equal(detectDelimiter("name|age|city\nDavid|35|Tokyo"), "|");
});

test("parseCSV correctly handles quotes, escaped quotes, and commas inside fields", () => {
  const csv = `id,name,bio\n1,"Doe, John","Software ""Lead"" Architect"\n2,Alice,Engineer`;
  const { headers, rows } = parseCSV(csv);

  assert.deepEqual(headers, ["id", "name", "bio"]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].id, "1");
  assert.equal(rows[0].name, "Doe, John");
  assert.equal(rows[0].bio, 'Software "Lead" Architect');
  assert.equal(rows[1].name, "Alice");
});

test("csvToJSON and jsonToCSV bi-directionally transform structured data", () => {
  const csv = "product,price,inStock\nLaptop,1200,true\nMouse,25,false";
  const jsonStr = csvToJSON(csv);
  const parsed = JSON.parse(jsonStr);

  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].product, "Laptop");
  assert.equal(parsed[0].price, "1200");

  const backToCsv = jsonToCSV(jsonStr);
  assert.ok(backToCsv.includes("product,price,inStock"));
  assert.ok(backToCsv.includes("Laptop,1200,true"));
});

test("csvToMarkdownTable produces clean GitHub Flavored Markdown table", () => {
  const csv = "Tool,Category,Privacy\nFileAlchemist,Media,100%\nPDFForge,Documents,100%";
  const markdown = csvToMarkdownTable(csv);

  assert.ok(markdown.includes("| Tool | Category | Privacy |"));
  assert.ok(markdown.includes("| --- | --- | --- |"));
  assert.ok(markdown.includes("| FileAlchemist | Media | 100% |"));
});

test("generateWAVFromPCM and parseWAVHeader create and read valid RIFF/WAVE files", () => {
  const sampleRate = 44100;
  const numChannels = 1;
  const numSamples = 44100; // 1 second of audio
  const pcm = new Float32Array(numSamples);

  // Generate 440 Hz Sine wave (Concert A)
  for (let i = 0; i < numSamples; i++) {
    pcm[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.8;
  }

  const wavBytes = generateWAVFromPCM(pcm, sampleRate, numChannels);
  assert.ok(wavBytes instanceof Uint8Array);
  assert.equal(wavBytes.length, 44 + numSamples * 2); // 44 header + 16-bit samples

  const meta = parseWAVHeader(wavBytes);
  assert.equal(meta.sampleRate, 44100);
  assert.equal(meta.numChannels, 1);
  assert.equal(meta.bitsPerSample, 16);
  assert.equal(meta.durationSeconds, 1.0);
});

test("parseDataURL and toDataURL handle binary Base64 encoding/decoding", () => {
  const testBytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
  const mimeType = "text/plain";
  const dataUrl = toDataURL(testBytes, mimeType);

  assert.ok(dataUrl.startsWith("data:text/plain;base64,"));
  const parsed = parseDataURL(dataUrl);
  assert.equal(parsed.mimeType, "text/plain");
  assert.equal(parsed.isBase64, true);
  assert.deepEqual(parsed.data, testBytes);

  // Invalid data URL throws
  assert.throws(() => parseDataURL("not-a-data-url"), /Invalid Data URL/);
});
