"use client";
export function PrintInvoice() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-navy my-6 rounded px-5 py-3 text-white print:hidden"
    >
      Print / save PDF
    </button>
  );
}
