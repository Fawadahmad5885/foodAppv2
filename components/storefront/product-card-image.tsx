"use client";

import Image from "next/image";

type ProductCardImageProps = {
  src: string | null;
  alt: string;
  className?: string;
};

export function ProductCardImage({
  src,
  alt,
  className = "",
}: ProductCardImageProps) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center text-5xl">
        🍔
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  );
}
