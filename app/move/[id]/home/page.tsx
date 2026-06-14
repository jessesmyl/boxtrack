import { redirect } from "next/navigation";

// The client view now lives at /c/<moveId>. Keep this old path working by
// forwarding any saved links/bookmarks to the new client side.
export default async function LegacyClientHome({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/c/${id}`);
}
