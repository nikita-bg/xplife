'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, Upload } from 'lucide-react'
import { AvatarCropDialog } from './avatar-crop-dialog'

interface SettingsFormProps {
  userId: string
  currentDisplayName: string
  currentAvatarUrl: string | null
}

export function SettingsForm({ userId, currentDisplayName, currentAvatarUrl }: SettingsFormProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(currentDisplayName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('users')
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (updateError) {
      setError('Failed to save: ' + updateError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
    router.refresh()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setCropImage(url)
    setCropDialogOpen(true)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleCropComplete = () => {
    setCropDialogOpen(false)
    setCropImage(null)
    router.refresh()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="mb-4 font-display text-lg font-bold text-foreground">Settings</h2>

      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <Label>Avatar</Label>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Upload Avatar
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        {saved && (
          <div className="rounded-lg bg-accent/10 p-3 text-sm text-accent">Changes saved successfully!</div>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>

        <div className="border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
      {cropImage && (
        <AvatarCropDialog
          open={cropDialogOpen}
          onOpenChange={(open) => {
            setCropDialogOpen(open)
            if (!open) setCropImage(null)
          }}
          imageSrc={cropImage}
          userId={userId}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}
