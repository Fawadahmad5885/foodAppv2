"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { inputClass, labelClass } from "@/components/dashboard/form-styles";
import { uploadProductImage } from "@/lib/actions/vendor/upload";
import { isValidImageUrl } from "@/lib/validation/image-url";

type ImageUrlFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
};

export function ImageUrlField({
  id,
  label,
  value,
  onChange,
  placeholder = "https://… or upload from your device",
}: ImageUrlFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    startUpload(async () => {
      const result = await uploadProductImage(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChange(result.url);
    });
  }

  const showPreview = value.trim() && isValidImageUrl(value);

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="mt-1 flex gap-2">
        <input
          id={id}
          type="url"
          value={value}
          onChange={(e) => {
            setError(null);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className={`min-w-0 flex-1 ${inputClass}`}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? "Uploading…" : "Browse"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {showPreview ? (
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              sizes="64px"
              unoptimized={value.startsWith("/uploads/")}
            />
          </div>
          <p className="break-all text-xs text-stone-500">{value}</p>
        </div>
      ) : (
        <div className="mt-3 flex h-20 items-center justify-center rounded-lg border border-dashed border-stone-200 bg-stone-50 text-stone-400">
          <div className="flex items-center gap-2 text-sm">
            <ImagePlus className="h-4 w-4" />
            Paste a URL or browse to upload
          </div>
        </div>
      )}
    </div>
  );
}
