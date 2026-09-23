"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { Badge, tone } from "@/components/admin/ui";
import { label } from "@/components/admin/RequestControls";

type Result = { id: string; type: string; href: string; reference: string; name: string; phone: string; status: string };

export default function GlobalSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search by ID, name or phone..."
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
        />
        {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />}
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-card">
          {results.length === 0 && !loading && <p className="px-4 py-6 text-center text-sm text-slate-500">No matches found.</p>}
          {results.map((r) => (
            <Link
              key={r.type + r.id}
              href={r.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-0 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-navy-900">
                  {r.name} <span className="font-normal text-slate-500">— {r.phone}</span>
                </p>
                <p className="text-slate-500">
                  {r.type} · {r.reference}
                </p>
              </div>
              <Badge t={tone[r.status]}>{label(r.status)}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
