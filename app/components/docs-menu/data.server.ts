import {
  getRepoDocsMenu,
  getRepoDocsReferenceMenu,
} from "~/modules/gh-docs/.server";

export type DocsMenu = Awaited<ReturnType<typeof loadDocsMenu>>;

export type ReferenceMenu = Awaited<ReturnType<typeof loadDocsMenu>>;

export async function loadDocsMenu(ref: string) {
  return getRepoDocsMenu(ref, "en");
}

export type Pkg = Awaited<ReturnType<typeof loadPackageData>>["pkgs"][number];

export async function loadPackageData(ref: string, pkg: string) {
  let menu = await getRepoDocsReferenceMenu(ref);

  let pkgName = pkg === "react-router" ? pkg : `@react-router/${pkg}`;
  let pkgMenu = menu.find((p) => p.attrs.title === pkgName);
  if (!pkgMenu) throw new Response("Not Found", { status: 404 });

  return {
    pkgs: menu.map(({ attrs }) => ({
      name: attrs.title,
      href: attrs.href,
    })),
    menu: pkgMenu.children,
  };
}
