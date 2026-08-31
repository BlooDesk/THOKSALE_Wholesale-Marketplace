import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'

const DEMO_RFQS = [
  {
    id: 'RFQ-2026-0914',
    title: 'Custom Branded 20W PD Fast Chargers with Type-C Braided Cables',
    category: 'Consumer Electronics & Mobile Accessories',
    quantity: '2,500 Units',
    target_price: '₹220 / pc',
    budget: '₹5,50,000',
    bids_count: 6,
    lowest_bid: '₹195 / pc',
    status: 'open',
    status_label: 'Open for Bids (6 Received)',
    expires_in: '2 Days Left',
    created_at: 'Aug 29, 2026',
  },
  {
    id: 'RFQ-2026-0881',
    title: 'Heavy Duty 5-Ply Corrugated Shipping Boxes (14x10x8 inch)',
    category: 'Packaging & Industrial Printing',
    quantity: '10,000 Boxes',
    target_price: '₹16 / box',
    budget: '₹1,60,000',
    bids_count: 4,
    lowest_bid: '₹14.50 / box',
    status: 'evaluation',
    status_label: 'Under Evaluation',
    expires_in: 'Bidding Closed',
    created_at: 'Aug 24, 2026',
  },
  {
    id: 'RFQ-2026-0740',
    title: 'Precision Stainless Steel Hex Bolts M8 x 40mm (Grade 304)',
    category: 'Industrial Hardware & Fasteners',
    quantity: '50,000 Pcs',
    target_price: '₹3.80 / pc',
    budget: '₹1,90,000',
    bids_count: 8,
    lowest_bid: '₹3.40 / pc',
    status: 'awarded',
    status_label: 'Awarded to SteelMax Mills',
    expires_in: 'Contract Active',
    created_at: 'Aug 10, 2026',
  },
]

export default async function RfqWorkspacePage() {
  let rfqs = DEMO_RFQS

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: dbRfqs } = await supabase
        .from('rfqs')
        .select(`
          id, title, category, quantity, unit, target_price, status, created_at, expires_at,
          rfq_quotes ( id, price, status )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (dbRfqs && dbRfqs.length > 0) {
        rfqs = dbRfqs.map((r: any) => ({
          id: r.id,
          title: r.title,
          category: r.category || 'Wholesale Sourcing',
          quantity: `${r.quantity} ${r.unit || 'units'}`,
          target_price: r.target_price ? `₹${r.target_price} / unit` : 'Open',
          budget: `₹${((r.target_price || 100) * r.quantity).toLocaleString('en-IN')}`,
          bids_count: r.rfq_quotes?.length || 0,
          lowest_bid: r.rfq_quotes?.length > 0 ? `₹${Math.min(...r.rfq_quotes.map((q: any) => q.price))} / unit` : 'Awaiting Bids',
          status: r.status,
          status_label: r.status === 'open' ? `Open for Bids (${r.rfq_quotes?.length || 0} Received)` : r.status,
          expires_in: 'Active',
          created_at: new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        }))
      }
    }
  } catch (err) {
    console.error('Fetch RFQs error:', err)
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Title & Post RFQ Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5924D]">
              Custom Wholesale Quotations
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight mt-0.5">
              Buyer RFQ Workspace
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Broadcast custom production requirements directly to verified OEM manufacturers.
            </p>
          </div>

          <Link
            href="/rfq/new"
            className="bg-[#B5924D] hover:bg-[#96773a] text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Post New RFQ</span>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0F172A] text-white">
            Active RFQs ({rfqs.length})
          </button>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            Awarded Contracts (1)
          </button>
        </div>

        {/* RFQ Cards List */}
        <div className="flex flex-col gap-4">
          {rfqs.map((rfq) => (
            <div
              key={rfq.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#B5924D] transition-all"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      #{rfq.id} • Posted {rfq.created_at}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500 font-semibold">{rfq.category}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      rfq.status === 'open'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    }`}
                  >
                    {rfq.status_label}
                  </span>
                </div>

                <Link href={`/rfq/${rfq.id}`}>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white hover:text-[#B5924D] transition-colors">
                    {rfq.title}
                  </h3>
                </Link>

                {/* Sourcing Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 mt-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Required Volume</span>
                    <span className="font-bold text-[#0F172A] dark:text-white">{rfq.quantity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Target Price</span>
                    <span className="font-mono font-bold text-[#0F172A] dark:text-white">{rfq.target_price}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Verified Bids</span>
                    <span className="font-bold text-[#B5924D]">{rfq.bids_count} Received</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Lowest Bid</span>
                    <span className="font-mono font-bold text-emerald-600">{rfq.lowest_bid}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400 font-medium">Timeline: {rfq.expires_in}</span>
                <Link
                  href={`/rfq/${rfq.id}`}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>Review Supplier Bids ({rfq.bids_count})</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <StitchBottomNav />
    </div>
  )
}
