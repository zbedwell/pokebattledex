import fs from "fs";
import { createTunnel } from "tunnel-ssh";
import { Pool } from "pg";
import { env } from "../config/env.js";

let dbConnectionPromise;

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

const createPool = () => {
  const ssl = env.databaseSsl
    ? { rejectUnauthorized: env.databaseSslRejectUnauthorized }
    : undefined;

  if (env.databaseUrl) {
    return new Pool({
      connectionString: env.databaseUrl,
      ...(ssl ? { ssl } : {}),
    });
  }

  return new Pool({
    host: env.localHost,
    port: env.localPort,
    database: env.databaseName,
    user: env.databaseUser,
    password: env.databasePassword,
    ...(ssl ? { ssl } : {}),
  });
};

const initDbConnection = async () => {
  let tunnelServer;
  let tunnelClient;

  if (env.dbUseTunnel) {
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

    const [server, client] = await createTunnel(
      tunnelOptions,
      serverOptions,
      sshOptions,
      forwardOptions,
    );

    tunnelServer = server;
    tunnelClient = client;
  }

  const pool = createPool();
  await pool.query("SELECT 1");

  return {
    pool,
    tunnelServer,
    tunnelClient,
    async close() {
      await pool.end();
      if (tunnelClient) {
        tunnelClient.end();
      }
      if (tunnelServer) {
        tunnelServer.close();
      }
    },
  };
};

export const getDbConnection = async () => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = initDbConnection();
  }

  return dbConnectionPromise;
};
