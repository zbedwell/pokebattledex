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

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: parseNumber(getEnv("PORT", "4000"), 4000),
  databaseName: getEnv("DATABASE_NAME"),
  databaseUser: getEnv("DATABASE_USER", getEnv("SSH_USER")),
  databasePassword: getEnv("DATABASE_PASSWORD"),
  localHost: getEnv("LOCAL_HOST", "127.0.0.1"),
  localPort: parseNumber(getEnv("LOCAL_PORT", "5432"), 5432),
  remoteHost: getEnv("REMOTE_HOST", "127.0.0.1"),
  remotePort: parseNumber(getEnv("REMOTE_PORT", "5432"), 5432),
  sshHost: getEnv("SSH_HOST"),
  sshPort: parseNumber(getEnv("SSH_PORT", "22"), 22),
  sshUser: getEnv("SSH_USER"),
  sshPrivateKeyPath: getEnv("SSH_PRIVATE_KEY"),
  sshPassphrase: getEnv("SSH_PASSPHRASE", getEnv("DATABASE_PASSWORD")),
  dbUseTunnel: getEnv("DB_USE_SSH_TUNNEL", "true") !== "false",
};

export const isProduction = env.nodeEnv === "production";
