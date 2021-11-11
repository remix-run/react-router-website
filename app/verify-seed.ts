import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

async function go() {
  let refs = await prisma.gitHubRef.findMany({
    select: { docs: { select: { id: true } } },
  });

  let everyRefHasDocs = refs.every((ref) => {
    return ref.docs.length > 0;
  });

  if (everyRefHasDocs) {
    console.log("> Seed Verified!");
    process.exit(0);
  } else {
    console.error("> uhhh, houston we have a problem...");
    process.exit(1);
  }
}

go();
