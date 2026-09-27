import { supabase } from "./supabaseClient";

/** Public bucket name if uploads are added later. This app has no current upload UI. */
export const MEDIA_BUCKET = "media";

export async function uploadPublicFile(file, pathPrefix = "uploads") {
  const ext = (file.name || "bin").split(".").pop();
  const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}
