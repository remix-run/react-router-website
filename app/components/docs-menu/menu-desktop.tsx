import { clsx } from "clsx";

export function NavMenuDesktop({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={clsx(
        "sticky bottom-0 top-16 hidden w-[--nav-width] flex-col gap-3 self-start overflow-auto py-6 pl-8 pr-6 lg:flex",
        // Account for the height of the top nav
        "h-[calc(100vh-var(--header-height))]",
      )}
    >
      <div className="[&_*:focus]:scroll-mt-[6rem]">{children}</div>
    </div>
  );
}
