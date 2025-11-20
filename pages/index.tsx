import React, { useEffect, useState } from "react";
import axios from "axios";

type Link = {
  code: string;
  url: string;
  clicks: number;
  lastClicked?: string | null;
  createdAt: string;
};

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await axios.get<Link[]>("/api/links");
      setLinks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!url) return setError("URL is required");
    if (!url.startsWith("http://") && !url.startsWith("https://")) return setError("URL must include protocol (http:// or https://)");
    if (code && !CODE_REGEX.test(code)) return setError("Custom code must match [A-Za-z0-9]{6,8}");
    setSubmitting(true);
    try {
      const res = await axios.post("/api/links", { url, code: code || undefined });
      setUrl("");
      setCode("");
      setLinks([res.data, ...links]);
    } catch (err: any) {
      if (err?.response?.status === 409) setError("Code already exists");
      else setError(err?.response?.data?.error ?? "Server error");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteLink(codeToDelete: string) {
    if (!confirm(`Delete ${codeToDelete}?`)) return;
    try {
      await axios.delete(`/api/links/${codeToDelete}`);
      setLinks(links.filter((l) => l.code !== codeToDelete));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">TinyLink Dashboard</h1>

      <form onSubmit={create} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="md:col-span-4 p-2 border rounded" placeholder="https://example.com/..." value={url} onChange={(e)=>setUrl(e.target.value)} />
          <input className="p-2 border rounded" placeholder="custom code (optional)" value={code} onChange={(e)=>setCode(e.target.value)} />
          <button disabled={submitting} className="p-2 bg-blue-600 text-white rounded">{submitting ? "Adding..." : "Add"}</button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>

      <div>
        {loading ? <div>Loading...</div> : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left">
                <th className="pb-2">Code</th>
                <th className="pb-2">Target</th>
                <th className="pb-2">Clicks</th>
                <th className="pb-2">Last clicked</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => (
                <tr key={link.code} className="border-t">
                  <td className="py-2">{link.code}</td>
                  <td className="py-2 truncate max-w-xs">
                    <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
                  </td>
                  <td className="py-2">{link.clicks}</td>
                  <td className="py-2">{link.lastClicked ? new Date(link.lastClicked).toLocaleString() : "Never"}</td>
                  <td className="py-2">
                    <a className="mr-2 text-blue-600" href={`/code/${link.code}`}>Stats</a>
                    <a className="mr-2 text-blue-600" href={`/${link.code}`} target="_blank" rel="noreferrer">Open</a>
                    <button className="text-red-600" onClick={() => deleteLink(link.code)}>Delete</button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && <tr><td colSpan={5} className="py-4">No links yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
