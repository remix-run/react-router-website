import {
  useNavigation,
  useLocation,
  useResolvedPath,
  matchPath,
} from "@remix-run/react";

// TODO: seems like RR already knows how to do something like this, need to look
// into the call sites and see wtheck, also why do we need `string[]`?
export function useIsActivePath(_to: string | string[]) {
  let navigation = useNavigation();
  let currentLocation = useLocation();
  let tos = Array.isArray(_to) ? _to : [_to];
  let matched = false;
  for (let to of tos) {
    // TODO: This is against the rules but the menu is static.
    let { pathname } = useResolvedPath(to); // eslint-disable-line
    let location =
      navigation.location && !navigation.formData
        ? navigation.location
        : currentLocation;
    let match = matchPath(pathname + "/*", location.pathname);
    matched = matched || Boolean(match);
  }
  return matched;
}
