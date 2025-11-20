import type { NextApiRequest, NextApiResponse } from "next";

export default function Health() {
  // simple page so GET /healthz returns 200 (server-side rendered)
  return (
    <div style={{ padding: 20 }}>
      <pre>{JSON.stringify({ ok: true, version: "1.0" }, null, 2)}</pre>
    </div>
  );
}
