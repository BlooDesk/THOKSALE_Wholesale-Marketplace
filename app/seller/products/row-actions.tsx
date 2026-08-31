'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteProduct } from '@/app/actions/products'

export function ProductRowActions({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()

  function doDelete() {
    start(async () => {
      const res = await deleteProduct(id)
      if (!res.ok) return toast.error(res.error)
      toast.success('Product archived')
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }} className="text-muted-foreground hover:[color:hsl(var(--destructive))]">
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              <b>{name}</b> will be archived and hidden from buyers. You can restore it later from support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} disabled={pending} className="bg-red-600 hover:bg-red-700">
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
