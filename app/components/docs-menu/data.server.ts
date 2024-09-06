import { type SerializeFrom } from "@remix-run/node";
import invariant from "tiny-invariant";
import {
  getRepoDocsMenu,
  getRepoDocsReferenceMenu,
} from "~/modules/gh-docs/.server";

export type GuidesMenu = Awaited<
  SerializeFrom<ReturnType<typeof loadGuidesMenu>>
>;

export type ReferenceMenu = Awaited<
  SerializeFrom<ReturnType<typeof loadGuidesMenu>>
>;

export async function loadGuidesMenu(ref: string) {
  return getRepoDocsMenu(ref, "en");
}

export async function loadReferenceMenu(ref: string, pkg: string) {
  let menu = await getRepoDocsReferenceMenu(ref);
  let pkgMenu = menu.find((p) => p.attrs.title === pkg);
  invariant(pkgMenu, `Expected package with name ${pkg}`);
  return pkgMenu.children;
}
