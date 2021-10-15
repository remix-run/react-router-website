import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

async function go() {
  let refs = await prisma.gitHubRef.count();

  if (refs) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

go();
