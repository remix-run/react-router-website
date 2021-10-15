import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

async function go() {
  let versions = await prisma.version.count();

  if (versions) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

go();
