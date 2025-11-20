import { GetServerSideProps } from "next";
import prisma from "../lib/prisma";

export default function RedirectPage() {
  // This page will never render in normal flow (redirect happens server-side)
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = context.params?.code as string | undefined;
  if (!code) return { notFound: true };

  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) {
    return { notFound: true };
  }

  // increment clicks and update lastClicked
  await prisma.link.update({
    where: { code },
    data: { clicks: { increment: 1 }, lastClicked: new Date() },
  });

  return {
    redirect: {
      destination: link.url,
      permanent: false, // 302
    },
  };
};
