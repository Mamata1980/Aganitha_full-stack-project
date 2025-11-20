import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import validator from "validator";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(links);
  }

  if (req.method === "POST") {
    const { url, code } = req.body;

    if (!url || !validator.isURL(url, { require_protocol: true })) {
      return res.status(400).json({ error: "Invalid URL. Include http:// or https://" });
    }

    let finalCode: string;
    if (code) {
      if (typeof code !== "string" || !CODE_REGEX.test(code)) {
        return res.status(400).json({ error: "Custom code must match [A-Za-z0-9]{6,8}" });
      }
      finalCode = code;
    } else {
      // generate a random 7-char code
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const generate = () =>
        Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      let attempt = 0;
      do {
        finalCode = generate();
        const exists = await prisma.link.findUnique({ where: { code: finalCode } });
        if (!exists) break;
        attempt++;
      } while (attempt < 5);

      // If still conflict, return error
      const exists = await prisma.link.findUnique({ where: { code: finalCode } });
      if (exists) return res.status(500).json({ error: "Unable to generate unique code, try again." });
    }

    try {
      const created = await prisma.link.create({
        data: { code: finalCode, url },
      });
      return res.status(201).json(created);
    } catch (err: any) {
      if (err?.code === "P2002") {
        // unique constraint
        return res.status(409).json({ error: "Code already exists" });
      }
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).end("Method Not Allowed");
}
