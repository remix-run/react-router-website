import {
  unstable_useRouterState as useRouterState,
  useResolvedPath,
} from "react-router";

export function useNavigation(to?: string, end?: boolean) {
  let { active, pending } = useRouterState();
  let locationPathname = active.location.pathname;
  let nextLocationPathname = pending?.location.pathname;
  let { pathname: toPathname } = useResolvedPath(to || "/");

  let isActive = false;
  let isPending = false;

  if (toPathname) {
    let endSlashPosition =
      toPathname !== "/" && toPathname.endsWith("/")
        ? toPathname.length - 1
        : toPathname.length;

    isActive =
      locationPathname === toPathname ||
      (!end &&
        locationPathname.startsWith(toPathname) &&
        locationPathname.charAt(endSlashPosition) === "/");

    isPending =
      nextLocationPathname != null &&
      (nextLocationPathname === toPathname ||
        (!end &&
          nextLocationPathname.startsWith(toPathname) &&
          nextLocationPathname.charAt(toPathname.length) === "/"));
  }

  return { isActive, isPending };
}
