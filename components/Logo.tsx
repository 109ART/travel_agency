import Image from "next/image";

export default function Logo({
  tone = "light",
  sub = "Agency Management Portal",
}: {
  tone?: "light" | "dark";
  sub?: string;
}) {
  const light = tone === "light";
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="SafarPro logo"
        width={56}
        height={56}
        priority
        className="h-12 w-12 flex-none rounded-xl object-contain shadow-lg sm:h-14 sm:w-14"
      />
      <span className="min-w-0 leading-tight">
        <span className={`block text-xl font-extrabold tracking-wide sm:text-2xl ${light ? "text-white" : "text-navy-900"}`}>
          SAFAR<span className="text-[#D4AF37]">PRO</span>
        </span>
        <span className={`block truncate text-xs ${light ? "text-white/70" : "text-slate-500"}`}>{sub}</span>
      </span>
    </div>
  );
}