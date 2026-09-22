"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { inputCls } from "@/components/admin/ui";

export default function PasswordField({
  label,
  name,
  required = true,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-navy-900">{label}</span>
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          required={required}
          minLength={8}
          className={`${inputCls} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-900"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}