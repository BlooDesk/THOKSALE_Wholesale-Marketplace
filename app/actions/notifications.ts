'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { ok: false; error: string }

export async function markNotificationRead(id: string): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated.' }
  const { error } = await supabase.from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', user.id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/notifications')
  return { ok: true }
}

export async function markAllNotificationsRead(): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated.' }
  await supabase.from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id).eq('is_read', false)
  revalidatePath('/notifications')
  return { ok: true }
}
