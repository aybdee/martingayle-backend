import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//database activity external to api here

export async function deleteAllBotSessions() {
  await prisma.botSession.deleteMany();
}

export default prisma;
