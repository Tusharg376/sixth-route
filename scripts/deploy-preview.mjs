import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// Build secrets remain private and are passed only to the server deployment.
const secrets = {};
for (const name of ["RESEND_API_KEY", "RESEND_FROM_EMAIL", "BRIEF_TO_EMAIL"]) {
  if (!process.env[name]) throw new Error(`Missing preview secret: ${name}`);
  secrets[name] = process.env[name];
}
const directory = await mkdtemp(join(tmpdir(), "sixth-route-preview-"));
try {
  const file = join(directory, "secrets.json");
  await writeFile(file, JSON.stringify(secrets), { mode: 0o600 });
  const result = spawnSync("npx", ["wrangler", "preview", "--secrets-file", file], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(directory, { recursive: true, force: true });
}
