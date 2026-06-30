"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireVendor } from "@/lib/auth/guards";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadProductImage(
  formData: FormData,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const { tenant } = await requireVendor();

  const file = formData.get("file");
  if (!file || !(file instanceof File) || file.size === 0) {
    return { success: false, error: "No file selected" };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      success: false,
      error: "Unsupported file type. Use JPEG, PNG, WebP, or GIF.",
    };
  }

  if (file.size > MAX_BYTES) {
    return { success: false, error: "Image must be 5 MB or smaller" };
  }

  const ext = EXT_BY_TYPE[file.type] ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", tenant.id);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return { success: true, url: `/uploads/${tenant.id}/${filename}` };
}
