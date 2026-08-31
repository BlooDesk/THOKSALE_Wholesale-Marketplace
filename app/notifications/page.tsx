import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarketplaceHeader } from '@/components/marketplace/header'
import { AppFooter } from '@/components/marketplace/footer'
import { Bell } from 'lucide-react'
import { NotificationRow, MarkAllReadButton } from './notifications-client'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/notifications')

  const { data: notifs } = await supabase
    .from('notifications')
    .select('id, type, title, body, data, is_read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  const unreadCount = (notifs || []).filter((n: any) => !n.is_read).length

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Activity</span>
            <h1 className="mt-2 flex items-center gap-3 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              <Bell className="h-7 w-7 [color:hsl(var(--accent))]" /> Notifications
              {unreadCount > 0 && <span className="ml-2 rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">{unreadCount}</span>}
            </h1>
          </div>
          {unreadCount > 0 && <MarkAllReadButton />}
        </div>

        {(!notifs || notifs.length === 0) ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border/70 bg-card/60 p-14 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary"><Bell className="h-6 w-6 text-foreground" /></span>
            <h3 className="mt-4 text-lg font-semibold text-foreground">You&rsquo;re all caught up</h3>
            <p className="mt-1 text-sm text-muted-foreground">Notifications about orders, RFQs and freight will appear here.</p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
            {notifs.map((n: any) => <NotificationRow key={n.id} n={n} />)}
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  )
}
