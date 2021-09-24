import * as React from "react";
import { useLocation } from "react-router-dom";
import { useRect } from "@reach/rect";
import { useMatchScreen } from "~/hooks/match-media";
import { Link } from "remix";
import cx from "clsx";
import logoCircleUrl from "~/icons/logo-circle.svg";
import { NavLink } from "~/components/link";
// import type { MenuDir, VersionHead } from "~/utils.server";
import type { NavLinkProps } from "react-router-dom";

const SiteHeader: React.VFC<{ className?: string }> = ({ className }) => {
  let isMediumScreen = useMatchScreen("md");
  let [navIsOpen, setNavIsOpen] = useHeaderNavState(false, isMediumScreen);
  let headerRef = React.useRef<HTMLElement>(null);
  let navRef = React.useRef<HTMLElement>(null);
  useSetBodyHeaderAttributes();
  useSetHeaderHeight(headerRef);

  return (
    <header
      ref={headerRef}
      className={cx(className, [
        "border-b border-solid",
        "bg-[color:var(--base00)]",
        "py-[25px]",
        "w-full top-0",
        "border-[color:var(--base02)]",
        "z-10",
        "md:static md:z-[initial]",
      ])}
    >
      <div className="flex items-center justify-between container sm-down:max-w-none">
        <Link
          to="/"
          className="flex items-center space-x-4 text-[color:var(--base07)] hover:text-[color:var(--base07)]"
        >
          <svg className="w-9 h-9" aria-hidden>
            <use href={`${logoCircleUrl}#logo-circle`} />
          </svg>
          <span className="text-3xl font-bold font-display">React Router</span>
        </Link>
        <button
          id="nav-toggle"
          className="block md:hidden"
          onClick={() => setNavIsOpen((old) => !old)}
          aria-label="Toggle navigation menu"
          aria-expanded={navIsOpen}
          aria-controls="main-site-nav"
          type="button"
        >
          {navIsOpen ? <Close /> : <Hamburger />}
        </button>
        <nav
          ref={navRef}
          // TODO: Update styles to match mocks. This was just enough to get
          // it working.
          className={cx(
            [
              "fixed md:static",
              "z-40 md:z-auto",
              "h-full md:h-auto",
              "w-[calc(100%-theme(spacing.14))] md:w-auto",
              "p-8 md:p-0",
              "overflow-y-scroll md:overflow-y-visible",
              "bg-[color:var(--base00)] md:bg-transparent",
              "inset-0 right-[theme(spacing.14)]",
              "flex-none",
            ],
            {
              block: navIsOpen,
              ["hidden md:block"]: !navIsOpen,
            }
          )}
          aria-label="Main navigation"
          id="main-site-nav"
        >
          <ul className="md:flex md:space-x-8">
            <li>
              <HeaderNavLink to="/docs/">Documentation</HeaderNavLink>
            </li>
            <li>
              <HeaderNavLink to="/resources/">Resources</HeaderNavLink>
            </li>
            <li>
              <HeaderNavLink to="https://github.com/remix-run/react-router">
                GitHub
              </HeaderNavLink>
            </li>
            <li>
              <HeaderNavLink to="https://npm.im/react-router">
                NPM
              </HeaderNavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

function Hamburger() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 16"
      stroke="currentColor"
      className="block w-5 h-4"
      aria-hidden="true"
    >
      <path fill="currentColor" d="M0 0h20v2H0zM0 6h20v2H0zM0 12h20v2H0z" />
    </svg>
  );
}

function Close() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="block w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M4 18L18.142 3.858l1.414 1.414L5.414 19.414z"
      />
      <path
        fill="currentColor"
        d="M5 4l14.142 14.142-1.414 1.414L3.586 5.414z"
      />
    </svg>
  );
}

export { SiteHeader };

export function useSetHeaderHeight<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>
) {
  let { height } = useRect(ref) || ({} as DOMRect);
  React.useEffect(() => {
    let root = document.documentElement;
    if (height != null) {
      root.style.setProperty("--site-header-height", `${height}px`);
    }
    return () => {
      root.style.removeProperty("--site-header-height");
    };
  }, [height]);
}

/**
 * Adds attributes to the body element indicating that the header is present on
 * the page.
 */
export function useSetBodyHeaderAttributes() {
  let [done, setDone] = React.useState(false);
  React.useEffect(() => {
    const DATA_HAS_HEADER = "data-has-header";
    document.body.setAttribute(DATA_HAS_HEADER, "");
    setDone(true);
    return () => {
      document.body.removeAttribute(DATA_HAS_HEADER);
    };
  }, []);
  return done;
}

export function useHeaderNavState(initialState: boolean, meetsScreenSizeThreshold: boolean) {
  let [navIsOpen, setNavIsOpen] = React.useState(initialState);
  let location = useLocation();

  React.useEffect(() => {
    const DATA_NAV_OPEN = "data-nav-open";
    if (meetsScreenSizeThreshold) {
      return cleanup;
    }
    if (navIsOpen) {
      document.body.setAttribute(DATA_NAV_OPEN, "");
    } else {
      document.body.removeAttribute(DATA_NAV_OPEN);
    }

    return cleanup;
    function cleanup() {
      document.body.removeAttribute(DATA_NAV_OPEN);
    }
  }, [navIsOpen, meetsScreenSizeThreshold]);

  React.useEffect(() => {
    if (meetsScreenSizeThreshold) {
      setNavIsOpen(false);
    }
  }, [meetsScreenSizeThreshold]);

  React.useEffect(() => {
    setNavIsOpen(false);
  }, [location]);

  React.useEffect(() => {
    if (navIsOpen) {
      let listener = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setNavIsOpen(false);
        }
      };
      window.addEventListener("keydown", listener);
      return () => {
        window.removeEventListener("keydown", listener);
      };
    }
  }, [navIsOpen]);

  return [navIsOpen, setNavIsOpen] as const;
}

function HeaderNavLink({ to, className, ...props }: NavLinkProps) {
  return (
    <NavLink
      to={to}
      {...props}
      className={(args) =>
        cx(
          "font-medium",
          args.isActive
            ? "opacity-100"
            : "text-[color:var(--base07)] hover:text-[color:var(--base07)] opacity-80 hover:opacity-100",
          typeof className === "function" ? className(args) : className
        )
      }
    />
  );
}
