"use client";

import Papa from "papaparse";
import { Download } from "lucide-react";
import { Btn } from "@/components/admin/ui";

export type SalesRow = {
  customer: string;
  service: string;
  saleDate: string;
  supplier: string;
  costPrice: number;
  sellingPrice: number;
  profit: number;
};

export default function ExportCsvButton({ rows, filename }: { rows: SalesRow[]; filename: string }) {
  const onExport = () => {
    const csv = Papa.unparse(
      rows.map((r) => ({
        "Customer Name": r.customer,
        "Ticket / Service Type": r.service,
        "Sale Date": r.saleDate,
        "Supplier Name": r.supplier,
        "Cost Price (PKR)": r.costPrice,
        "Selling Price (PKR)": r.sellingPrice,
        "Profit / Margin (PKR)": r.profit,
      })),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Btn onClick={onExport} disabled={rows.length === 0}>
      <Download size={16} /> Export to CSV
    </Btn>
  );
}
