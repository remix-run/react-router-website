import {
  unstable_useRouterState as useRouterState,
  useResolvedPath,
} from "react-router";

export function useNavState(to: string) {
  let { active, pending } = useRouterState();
  let resolved = useResolvedPath(to || "/");

  return {
    isActive: active.location.pathname === resolved.pathname,
    isPending: pending?.location.pathname === resolved.pathname,
  };
}
