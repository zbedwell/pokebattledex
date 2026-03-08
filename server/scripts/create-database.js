import fs from "fs";
import { createTunnel } from "tunnel-ssh";
import { Pool } from "pg";
import { env } from "../src/config/env.js";

const getPrivateKey = () => {
  if (!env.sshPrivateKeyPath) {
    return undefined;
  }

  try {
    return fs.readFileSync(env.sshPrivateKeyPath);
  } catch (error) {
    throw new Error(`Unable to read SSH private key at ${env.sshPrivateKeyPath}: ${error.message}`);
  }
};

const startTunnel = async () => {
  if (!env.dbUseTunnel) {
    return { tunnelServer: null, tunnelClient: null };
  }

  const sshOptions = {
    host: env.sshHost,
    port: env.sshPort,
    username: env.sshUser,
    privateKey: getPrivateKey(),
    passphrase: env.sshPassphrase,
  };

  const tunnelOptions = { autoClose: false };

  const serverOptions = {
    host: env.localHost,
    port: env.localPort,
  };

  const forwardOptions = {
    srcAddr: env.localHost,
    srcPort: env.localPort,
    dstAddr: env.remoteHost,
    dstPort: env.remotePort,
  };

  const [tunnelServer, tunnelClient] = await createTunnel(
    tunnelOptions,
    serverOptions,
    sshOptions,
    forwardOptions,
  );

  return { tunnelServer, tunnelClient };
};

const createAdminPool = () => {
  return new Pool({
    host: env.localHost,
    port: env.localPort,
    database: process.env.DATABASE_ADMIN_NAME || "postgres",
    user: process.env.DATABASE_ADMIN_USER || env.databaseUser,
    password: process.env.DATABASE_ADMIN_PASSWORD || env.databasePassword,
  });
};

const ensureDatabaseExists = async () => {
  if (!env.databaseName) {
    throw new Error("Missing DATABASE_NAME in environment.");
  }

  const { tunnelServer, tunnelClient } = await startTunnel();
  const pool = createAdminPool();

  try {
    const existsResult = await pool.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      env.databaseName,
    ]);

    if (existsResult.rowCount > 0) {
      console.log(`Database "${env.databaseName}" already exists.`);
      return;
    }

    const escapedDatabaseName = env.databaseName.replace(/"/g, '""');
    await pool.query(`CREATE DATABASE "${escapedDatabaseName}"`);
    console.log(`Created database "${env.databaseName}".`);
  } finally {
    await pool.end();
    if (tunnelClient) {
      tunnelClient.end();
    }
    if (tunnelServer) {
      tunnelServer.close();
    }
  }
};

ensureDatabaseExists().catch((error) => {
  console.error("Create database failed:", error);
  process.exit(1);
});
