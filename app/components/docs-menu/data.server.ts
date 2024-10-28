import {
  getRepoDocsMenu,
  getRepoDocsReferenceMenu,
} from "~/modules/gh-docs/.server";

export type GuidesMenu = Awaited<ReturnType<typeof loadGuidesMenu>>;

export type ReferenceMenu = Awaited<ReturnType<typeof loadGuidesMenu>>;

export async function loadGuidesMenu(ref: string) {
  return getRepoDocsMenu(ref, "en");
}

export async function loadReferenceMenu(ref: string, pkg: string) {
  let menu = await getRepoDocsReferenceMenu(ref);
  let pkgName = pkg === "react-router" ? pkg : `@react-router/${pkg}`;
  let pkgMenu = menu.find((p) => p.attrs.title === pkgName);
  if (!pkgMenu) throw new Response("Not Found", { status: 404 });
  return pkgMenu.children;
}

export type Pkg = {
  name: string;
  href: any;
};

export async function loadPackageNames(ref: string): Promise<Pkg[]> {
  let menu = await getRepoDocsReferenceMenu(ref);
  return menu.map((pkg) => {
    return {
      name: pkg.attrs.title,
      href: pkg.attrs.href,
    };
  });
}
