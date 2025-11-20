import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";

type Props = {
  link?: {
    code: string;
    url: string;
    clicks: number;
    lastClicked?: string | null;
    createdAt: string;
  } | null;
};

export default function Stats({ link }: Props) {
  if (!link) {
    return <div className="p-6">Link not found</div>;
  }
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stats for {link.code}</h1>
      <p><strong>Target:</strong> <a href={link.url} className="text-blue-600" target="_blank" rel="noreferrer">{link.url}</a></p>
      <p><strong>Total clicks:</strong> {link.clicks}</p>
      <p><strong>Last clicked:</strong> {link.lastClicked ?? "Never"}</p>
      <p><strong>Created at:</strong> {new Date(link.createdAt).toLocaleString()}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = context.params?.code as string | undefined;
  if (!code) return { notFound: true };

  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) return { notFound: true };

  return {
    props: {
      link: {
        code: link.code,
        url: link.url,
        clicks: link.clicks,
        lastClicked: link.lastClicked?.toISOString() ?? null,
        createdAt: link.createdAt.toISOString(),
      },
    },
  };
};
