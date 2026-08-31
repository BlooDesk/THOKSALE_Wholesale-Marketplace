'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { deletePartnerCode } from '@/app/actions/partner-codes'

export function CodeRowActions({ id, code }: { id: string; code: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()

  function del() {
    start(async () => {
      const res = await deletePartnerCode(id)
      if (!res.ok) return toast.error(res.error)
      toast.success('Code deleted')
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/seller/partner-codes/${id}/edit`}>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
      </Link>
      <Button variant="ghost" size="icon" className="h-8 w-8 [color:hsl(var(--destructive))]" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete code {code}?</AlertDialogTitle>
            <AlertDialogDescription>This code will no longer be usable by buyers.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={del} disabled={pending} className="bg-red-600 hover:bg-red-700">
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
