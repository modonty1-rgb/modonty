/** POST the picked file to our avatar route; the caller keeps only the returned URL. */
export async function uploadAvatar(file: File) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/users/profile/api/avatar", { method: "POST", body });
  const json = (await res.json()) as { success: boolean; url?: string; error?: string };
  return { ok: res.ok, json };
}
