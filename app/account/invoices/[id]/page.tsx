import Link from 'next/link'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'

export default async function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  const invoice = {
    id: id || 'INV-2026-0842',
    order_id: 'TS-20260829-4821',
    date: '29-Aug-2026',
    supply_state: 'Maharashtra (State Code: 27)',
    seller: {
      name: 'TechAudio Manufacturing Ltd',
      address: 'Plot 42, Hinjewadi Industrial Phase 2, Pune, Maharashtra - 411057',
      gstin: '27AABCT9981F1Z2',
      pan: 'AABCT9981F',
    },
    buyer: {
      name: 'Apex Retailers & Wholesalers Pvt Ltd',
      address: 'Unit 402, Trade Square Logistics Park, Hinjewadi Phase 1, Pune, MH - 411057',
      gstin: '27AABCA1234F1Z5',
      pan: 'AABCA1234F',
    },
    items: [
      {
        description: '10000mAh PD Fast Charging Power Bank Type-C Dual Output',
        hsn: '85076000',
        qty: 50,
        unit: 'PCS',
        rate: 850,
        taxable: 42500,
        cgst_rate: 9,
        cgst_amt: 3825,
        sgst_rate: 9,
        sgst_amt: 3825,
        total: 50150,
      },
    ],
    total_taxable: 42500,
    total_cgst: 3825,
    total_sgst: 3825,
    grand_total: 50150,
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Breadcrumb & Actions */}
        <div className="flex items-center justify-between">
          <Link href="/account/invoices" className="text-xs font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>All Invoices</span>
          </Link>
          <button className="px-4 py-2 rounded-xl bg-[#B5924D] text-white text-xs font-bold hover:bg-[#96773a] transition-all flex items-center gap-1.5 shadow-xs">
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download Signed Tax Invoice PDF</span>
          </button>
        </div>

        {/* Printable Tax Invoice Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B5924D]">
                Original for Recipient (Tax Invoice)
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-mono text-[#0F172A] dark:text-white mt-0.5">
                {invoice.id}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Date of Issue: {invoice.date}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-[#0F172A] dark:text-white">THOKSALE Settlement Rail</span>
              <p className="text-[10px] text-slate-500">Place of Supply: {invoice.supply_state}</p>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Seller (Supplier)</span>
              <p className="font-bold text-[#0F172A] dark:text-white text-sm">{invoice.seller.name}</p>
              <p className="text-slate-600 dark:text-slate-400">{invoice.seller.address}</p>
              <p className="font-mono font-bold text-[#B5924D] pt-1">GSTIN: {invoice.seller.gstin}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Buyer (Consignee)</span>
              <p className="font-bold text-[#0F172A] dark:text-white text-sm">{invoice.buyer.name}</p>
              <p className="text-slate-600 dark:text-slate-400">{invoice.buyer.address}</p>
              <p className="font-mono font-bold text-[#B5924D] pt-1">GSTIN: {invoice.buyer.gstin}</p>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Description of Goods</th>
                  <th className="py-2.5 px-2">HSN</th>
                  <th className="py-2.5 px-2 text-right">Qty</th>
                  <th className="py-2.5 px-2 text-right">Rate</th>
                  <th className="py-2.5 px-2 text-right">Taxable</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-semibold text-[#0F172A] dark:text-white">{it.description}</td>
                    <td className="py-3 px-2 font-mono text-slate-500">{it.hsn}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold">{it.qty} {it.unit}</td>
                    <td className="py-3 px-2 text-right font-mono">₹{it.rate}</td>
                    <td className="py-3 px-2 text-right font-mono">₹{it.taxable.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#0F172A] dark:text-white">
                      ₹{it.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Summary Totals */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-xs text-slate-500 space-y-1">
              <p>• CGST 9%: ₹{invoice.total_cgst.toLocaleString('en-IN')}</p>
              <p>• SGST 9%: ₹{invoice.total_sgst.toLocaleString('en-IN')}</p>
              <p className="text-emerald-600 font-semibold">• Digitally verified by THOKSALE Nodal Rail</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-right min-w-[220px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Amount</span>
              <span className="font-mono text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white">
                ₹{invoice.grand_total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </main>

      <StitchBottomNav />
    </div>
  )
}
