'use client'

import { Trophy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LevelUpModalProps {
  open: boolean
  onClose: () => void
  level: number
  title: string
}

export function LevelUpModal({ open, onClose, level, title }: LevelUpModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-card border-border text-center sm:max-w-md">
        <DialogHeader className="items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent animate-pulse-glow">
            <Trophy className="h-10 w-10 text-primary-foreground" />
          </div>
          <DialogTitle className="font-display text-2xl text-foreground">Level Up!</DialogTitle>
          <DialogDescription className="text-center">
            Congratulations! You have reached a new level.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-primary/10 p-6">
          <p className="font-display text-4xl font-bold text-primary">Level {level}</p>
          <p className="mt-1 text-sm text-muted-foreground">{title}</p>
        </div>

        <Button onClick={onClose} className="w-full">
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  )
}
