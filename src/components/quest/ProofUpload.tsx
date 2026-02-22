'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';

interface ProofUploadProps {
    taskId: string;
    onUploadComplete: (url: string) => void;
    onCancel: () => void;
}

export default function ProofUpload({ taskId, onUploadComplete, onCancel }: ProofUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploaded, setUploaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File) => {
        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('taskId', taskId);

            const response = await fetch('/api/proofs/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Upload failed');
                return;
            }

            setUploaded(true);
            onUploadComplete(data.url);
        } catch {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleFile = useCallback((file: File) => {
        setError(null);

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setError('Only JPEG, PNG, and WebP images are allowed');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File must be under 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        uploadFile(file);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskId]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    return (
        <div className="space-y-3">
            {!preview ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
            relative cursor-pointer rounded-xl border-2 border-dashed p-6
            flex flex-col items-center justify-center gap-3
            transition-all duration-300
            ${isDragging
                            ? 'border-accent bg-accent/5 scale-[1.02]'
                            : 'border-white/10 hover:border-accent/40 hover:bg-white/[0.02]'
                        }
          `}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-accent/20 text-accent' : 'bg-white/5 text-ghost/40'}`}>
                        <Upload size={24} />
                    </div>
                    <div className="text-center">
                        <p className="font-sans text-sm text-ghost/70">
                            {isDragging ? 'Drop your image here' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="font-data text-[10px] text-ghost/30 mt-1 tracking-wider">
                            JPEG, PNG, WebP · Max 5MB
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                        }}
                    />
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Proof preview" className="w-full h-40 object-cover" />

                    {/* Overlay states */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 size={32} className="text-accent animate-spin" />
                        </div>
                    )}

                    {uploaded && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <CheckCircle size={32} className="text-green-400" />
                        </div>
                    )}

                    {!uploading && !uploaded && (
                        <button
                            onClick={() => { setPreview(null); setError(null); }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                            <X size={14} className="text-white" />
                        </button>
                    )}
                </div>
            )}

            {error && (
                <p className="font-data text-xs text-red-400 text-center">{error}</p>
            )}

            {!preview && (
                <button
                    onClick={onCancel}
                    className="w-full py-2 text-center font-data text-xs text-ghost/40 hover:text-ghost/60 transition-colors tracking-wider"
                >
                    SKIP PROOF
                </button>
            )}
        </div>
    );
}
