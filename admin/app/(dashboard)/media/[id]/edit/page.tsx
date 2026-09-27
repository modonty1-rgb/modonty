import { getMediaById } from "../../actions/media-actions";
import { getClients } from "../../actions/get-clients";
import { notFound } from "next/navigation";
import { EditMediaForm } from "./edit-media-form";

/** Only these two pages open the editor; anything else in `back` is ignored (no open redirect). */
const BACK_ALLOWED = /^\/((clients|articles|modonty)\/)?media(\?[\w=&%.-]*)?$/;

export default async function EditMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ back?: string }>;
}) {
  const [{ id }, { back }] = await Promise.all([params, searchParams]);
  const backHref = back && BACK_ALLOWED.test(back) ? back : "/media";
  const [media, clients] = await Promise.all([getMediaById(id), getClients()]);

  if (!media) {
    notFound();
  }

  const transformedMedia = {
    ...media,
    client: media.client || undefined,
  };

  return <EditMediaForm media={transformedMedia} clients={clients} backHref={backHref} />;
}
