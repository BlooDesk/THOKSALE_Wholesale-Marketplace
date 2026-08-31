import Link from 'next/link'
import { StitchSellerNav } from '@/components/seller/stitch-seller-nav'
import { SellerInventoryClient } from './inventory-client'

export default function SellerInventoryPage() {
  const initialItems = [
    {
      id: 'inv-1',
      title: '10000mAh PD Fast Charging Power Bank Type-C Dual Output',
      sku: 'PWR-10K-PD-IND',
      stock: 4500,
      reserved: 300,
      moq: 50,
      unit: 'pcs',
      location: 'Pune Warehouse A-14',
    },
    {
      id: 'inv-2',
      title: 'Heavy Duty 2-inch Packaging Bopp Tape 65m (48 Micron)',
      sku: 'TAPE-BOPP-65M',
      stock: 18000,
      reserved: 1200,
      moq: 200,
      unit: 'rolls',
      location: 'Surat Mill Floor G-02',
    },
    {
      id: 'inv-3',
      title: 'Industrial Grade 6204-2RS Deep Groove Ball Bearing',
      sku: 'BRG-6204-2RS',
      stock: 8200,
      reserved: 400,
      moq: 100,
      unit: 'pcs',
      location: 'Ludhiana Central Depot',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchSellerNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/seller" className="text-xs font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Seller Console</span>
          </Link>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-bold text-[#0F172A] dark:text-white">Inventory Management</span>
        </div>

        {/* Title */}
        <div className="flex justify-between items-baseline">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Factory Inventory & Stock Control
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Live batch adjustments, warehouse pallet locations, and safety stock thresholds.
            </p>
          </div>
        </div>

        {/* Interactive Inventory Client */}
        <SellerInventoryClient initialItems={initialItems} />
      </main>
    </div>
  )
}
