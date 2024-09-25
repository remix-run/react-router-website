import {
  useLocation,
  useNavigation as useNavigation_,
  useResolvedPath,
} from "@remix-run/react";

export function useNavigation(to?: string, end?: boolean) {
  let navigation_ = useNavigation_();
  let location = useLocation();
  let locationPathname = location.pathname;
  let nextLocationPathname = navigation_.location?.pathname;
  let { pathname: toPathname } = useResolvedPath(to || "/");

  let navigation = Object.assign(
    { isActive: false, isPending: false },
    navigation_
  );

  if (toPathname) {
    let endSlashPosition =
      toPathname !== "/" && toPathname.endsWith("/")
        ? toPathname.length - 1
        : toPathname.length;

    let isActive =
      locationPathname === toPathname ||
      (!end &&
        locationPathname.startsWith(toPathname) &&
        locationPathname.charAt(endSlashPosition) === "/");

    let isPending =
      nextLocationPathname != null &&
      (nextLocationPathname === toPathname ||
        (!end &&
          nextLocationPathname.startsWith(toPathname) &&
          nextLocationPathname.charAt(toPathname.length) === "/"));

    Object.assign(navigation, { isActive, isPending });
  }

  return navigation;
}
