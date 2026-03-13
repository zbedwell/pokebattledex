import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default to the repository root .env when running via npm --prefix server
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });

const getEnv = (key, fallback = undefined) => {
  const value = process.env[key];
  return value === undefined || value === "" ? fallback : value;
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
};

const isVercel = getEnv("VERCEL", "0") === "1";

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: parseNumber(getEnv("PORT", "4000"), 4000),
  isVercel,
  databaseUrl: getEnv("DATABASE_URL"),
  databaseName: getEnv("DATABASE_NAME"),
  databaseUser: getEnv("DATABASE_USER", getEnv("SSH_USER")),
  databasePassword: getEnv("DATABASE_PASSWORD"),
  databaseSsl: parseBoolean(getEnv("PGSSL", getEnv("DATABASE_SSL", "false")), false),
  databaseSslRejectUnauthorized: parseBoolean(
    getEnv("PGSSL_REJECT_UNAUTHORIZED", "false"),
    false,
  ),
  localHost: getEnv("LOCAL_HOST", "127.0.0.1"),
  localPort: parseNumber(getEnv("LOCAL_PORT", "5432"), 5432),
  remoteHost: getEnv("REMOTE_HOST", "127.0.0.1"),
  remotePort: parseNumber(getEnv("REMOTE_PORT", "5432"), 5432),
  sshHost: getEnv("SSH_HOST"),
  sshPort: parseNumber(getEnv("SSH_PORT", "22"), 22),
  sshUser: getEnv("SSH_USER"),
  sshPrivateKeyPath: getEnv("SSH_PRIVATE_KEY"),
  sshPassphrase: getEnv("SSH_PASSPHRASE", getEnv("DATABASE_PASSWORD")),
  dbUseTunnel: parseBoolean(getEnv("DB_USE_SSH_TUNNEL", isVercel ? "false" : "true"), !isVercel),
};

export const isProduction = env.nodeEnv === "production";
