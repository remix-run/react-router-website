import { prismaRead as prisma } from "./db.server";

async function go() {
  let refs = await prisma.gitHubRef.count();

  if (refs) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

go();
