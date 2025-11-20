import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (!code || typeof code !== "string") return res.status(400).json({ error: "Missing code" });

  if (req.method === "GET") {
    const link = await prisma.link.findUnique({ where: { code } });
    if (!link) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(link);
  }

  if (req.method === "DELETE") {
    // delete link
    await prisma.link.deleteMany({ where: { code } }); // deleteMany avoids 404 exception
    return res.status(204).end();
  }

  res.setHeader("Allow", "GET, DELETE");
  return res.status(405).end("Method Not Allowed");
}
