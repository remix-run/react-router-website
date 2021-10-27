import { PrismaClient } from "@prisma/client";

declare global {
  var readDB: PrismaClient;
  var writeDB: PrismaClient;
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const primaryDB = new URL(DATABASE_URL);
const regionalDB = new URL(DATABASE_URL);

const isLocalHost = regionalDB.hostname === "localhost";
const PRIMARY_REGION = isLocalHost ? null : process.env.PRIMARY_REGION;

if (!PRIMARY_REGION) {
  throw new Error("PRIMARY_REGION is not defined");
}

const FLY_REGION = isLocalHost ? null : process.env.FLY_REGION;

if (!FLY_REGION) {
  throw new Error("FLY_REGION is not defined");
}

const isPrimaryRegion = PRIMARY_REGION === FLY_REGION;

if (!isLocalHost) {
  regionalDB.host = `${FLY_REGION}.${regionalDB.host}`;
  primaryDB.host = `${PRIMARY_REGION}.${primaryDB.host}`;
  if (!isPrimaryRegion) {
    // read-replica port is 5433
    regionalDB.port = "5433";
  }
}

function getClient(url: URL, type: "read" | "write"): PrismaClient {
  let client = new PrismaClient({
    datasources: {
      db: {
        url: url.toString(),
      },
    },
  });

  // make the connection eagerly so the first request doesn't have to wait
  void client.$connect();
  return client;
}

let prismaRead: PrismaClient;
let prismaWrite: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prismaRead = getClient(primaryDB, "read");
  prismaWrite = getClient(primaryDB, "write");
} else {
  if (!global.readDB) {
    global.readDB = getClient(primaryDB, "read");
  }

  if (!global.writeDB) {
    global.writeDB = getClient(primaryDB, "write");
  }

  prismaRead = global.readDB;
  prismaWrite = global.writeDB;
}

export { prismaRead, prismaWrite };
