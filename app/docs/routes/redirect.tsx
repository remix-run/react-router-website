import type { LoaderFunction } from "remix";
import { redirect } from "remix";
import { getVersions } from "../../utils.server";

export let loader: LoaderFunction = async ({ context }) => {
  let versions = await getVersions(context.docs);
  return redirect(`/${versions[0].head}`);
};

export default function Index() {
  return null;
}
