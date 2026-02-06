'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface ProofUploadProps {
  taskId: string
  userId: string
  onUpload: (url: string | null) => void
}

export function ProofUpload({ taskId, userId, onUpload }: ProofUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload to Supabase Storage
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/${taskId}-${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('task-proofs')
      .upload(path, file)

    if (error) {
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('task-proofs')
      .getPublicUrl(data.path)

    onUpload(publicUrl)
    setUploading(false)
  }

  const handleRemove = () => {
    setPreview(null)
    onUpload(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">Proof (optional)</p>
      <p className="mb-3 text-xs text-muted-foreground">
        Upload a screenshot or photo as proof of completion
      </p>

      {preview ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Proof preview"
            className="h-40 w-auto rounded-xl border border-border object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          {uploading ? (
            <>
              <Upload className="h-5 w-5 animate-pulse" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-5 w-5" />
              <span className="text-sm">Click to upload proof</span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
