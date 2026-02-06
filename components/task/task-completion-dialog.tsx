'use client'

import { Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface TaskCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  xpReward: number
  onConfirm: () => void
  loading: boolean
}

export function TaskCompletionDialog({
  open,
  onOpenChange,
  xpReward,
  onConfirm,
  loading,
}: TaskCompletionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">Complete Quest?</DialogTitle>
          <DialogDescription>
            Confirm that you have completed this quest to earn your reward.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 p-4">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-display text-lg font-bold text-primary">+{xpReward} XP</span>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'Completing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
