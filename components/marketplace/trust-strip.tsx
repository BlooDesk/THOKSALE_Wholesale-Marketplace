// ============================================================
// THOKSALE — Trust Strip
// "Escrow Protected · KYC Verified · Pan-India Logistics" bar
// ============================================================

const TRUST_ITEMS = [
  { icon: 'verified_user',   text: 'KYC Verified Suppliers' },
  { icon: 'lock',            text: 'Escrow Protected Payments' },
  { icon: 'local_shipping',  text: 'Pan-India Freight' },
  { icon: 'receipt_long',    text: 'GST Compliant Invoices' },
  { icon: 'support_agent',   text: 'Dedicated B2B Support' },
]

export function TrustStrip() {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-3 min-w-max px-0.5 py-1">
        {TRUST_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {item.icon}
            </span>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {item.text}
            </span>
            {i < TRUST_ITEMS.length - 1 && (
              <span className="text-slate-300 dark:text-slate-700 text-xs ml-1.5">·</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
