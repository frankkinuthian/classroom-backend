import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const required = ["APMINSIGHT_LICENSE_KEY"];

for (const key of required) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const config = {
  licenseKey: process.env.APMINSIGHT_LICENSE_KEY,
  appName: process.env.APMINSIGHT_APP_NAME || "classroom_backend",
  port: Number(process.env.APMINSIGHT_PORT || 10000),
};

if (!Number.isFinite(config.port) || config.port <= 0) {
  console.error("APMINSIGHT_PORT must be a valid positive number");
  process.exit(1);
}

const outputPath = resolve(process.cwd(), "apminsightnode.json");
writeFileSync(outputPath, JSON.stringify(config), "utf8");

console.log(`Generated ${outputPath}`);
