"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const POLL_MS = 30_000;

export default function RefreshButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const id = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [router]);

  const onClick = () => {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <button
      onClick={onClick}
      title="Refresh data now (also auto-refreshes every 30s)"
      className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 hover:text-navy-900"
    >
      <RefreshCw size={16} className={spinning ? "animate-spin" : ""} />
    </button>
  );
}
