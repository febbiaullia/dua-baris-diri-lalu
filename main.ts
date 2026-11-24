// Two Lines to Your Past Self
// make.fun bounty: u-suga-two-lines-to-your-past-self-f36c83ca
//
// The entry is two lines — a warning to the writer's past self about
// one specific moment, and one sentence on why that moment mattered —
// stored as two string constants in this repository. Running the
// program writes the two lines into the harness output directory as
// entry.txt, joined by a single newline with no trailing newline, then
// reads the copy back and checks it against the original byte for
// byte, so the two graded runs always produce identical output. No
// network is used and nothing is read from outside the repository:
// the two lines are the deliverable.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Line 1: warn the past self about one specific moment, one sentence.
const LINE_1 =
  "Don't say 'I don't care' at the dinner table when your sister asks if you're coming home for Eid.";

// Line 2: say in one sentence why that moment mattered and what
// changed because of it.
const LINE_2 =
  "She stops asking after that night, and you learn too late that her question was the only invitation you had.";

// The gate allows 1 to 280 characters (code points) in total.
const MIN_CHARS = 1;
const MAX_CHARS = 280;

// The harness sets MAKEFUN_OUTPUT_DIR; without it, write to /output.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "entry.txt");

function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

// Check the two lines before writing them: 1–280 characters in total
// (counted in code points, so an emoji or accented letter counts
// once), not only white space, exactly two lines joined by one "\n"
// with no trailing newline and no "\r", and no leading or trailing
// whitespace on either line — otherwise the gate would refuse the
// entry instead of judging it.
function checkEntry(text: string): void {
  const chars = [...text].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    fail(`entry must be ${MIN_CHARS}–${MAX_CHARS} characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    fail("entry must not be only white space");
  }
  if (text.includes("\r")) {
    fail("entry must not contain carriage returns");
  }
  const lines = text.split("\n");
  if (lines.length !== 2) {
    fail(`entry must be exactly two lines, got ${lines.length}`);
  }
  for (const line of lines) {
    if (line.trim().length === 0) {
      fail("each line must not be empty");
    }
    if (line !== line.trim()) {
      fail("each line must not start or end with whitespace");
    }
    // Each line is one sentence: it ends with a full stop and holds
    // no other sentence-ending punctuation before it.
    if (!line.endsWith(".")) {
      fail("each line must be a single sentence ending with a full stop");
    }
    if (/[.?!][^"]/.test(line.slice(0, -1))) {
      fail("each line must be a single sentence");
    }
  }
  // The gate reads UTF-8 text: refuse a text that does not survive a
  // UTF-8 round trip unchanged (for example a lone surrogate), so what
  // is written is exactly the text that was checked.
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    fail("entry must be valid UTF-8 text");
  }
}

const TEXT = LINE_1 + "\n" + LINE_2;

checkEntry(TEXT);
console.log(`Line 1: ${LINE_1}`);
console.log(`Line 2: ${LINE_2}`);
console.log(`Entry (${[...TEXT].length} characters):`);
console.log(TEXT);
console.log(`Entry sha256: ${sha256Hex(Buffer.from(TEXT, "utf8"))}`);

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, TEXT, "utf8");

// Read the copy back and prove it matches the original byte for byte.
const written = readFileSync(outputPath);
const original = Buffer.from(TEXT, "utf8");
if (!written.equals(original)) {
  fail(
    `copy mismatch: ${outputPath} is ${written.length} bytes, ` +
      `expected ${original.length}`,
  );
}

console.log(`Wrote ${written.length} bytes to ${outputPath} (byte-identical copy)`);
