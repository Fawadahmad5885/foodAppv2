import { z } from "zod";

export function isValidImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

export const imageUrlSchema = z
  .string()
  .min(1)
  .refine(isValidImageUrl, {
    message: "Enter a valid image URL or upload a file",
  });
