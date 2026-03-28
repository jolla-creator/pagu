'use client'

import { useState, useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { Spinner } from './Spinner'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        onChange(data.url)
      } else {
        setError(data.error || 'Errore upload')
      }
    } catch {
      setError('Errore di connessione')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (value) {
    return (
      <div className="relative">
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100">
          <img src={value} alt="Immagine piatto" className="w-full h-full object-cover" />
        </div>
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="aspect-video w-full rounded-2xl border-2 border-dashed border-neutral-200 hover:border-brand-400 bg-neutral-50 hover:bg-brand-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
      >
        {uploading ? (
          <Spinner size="md" />
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-neutral-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-700">Carica immagine</p>
              <p className="text-xs text-neutral-400 mt-0.5">Trascina o clicca per selezionare</p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}

      <p className="text-xs text-neutral-400 mt-2">JPEG, PNG, WebP o GIF. Max 5MB.</p>
    </div>
  )
}
