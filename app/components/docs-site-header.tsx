import * as React from "react";
import { useLocation } from "react-router-dom";
import { useMatchScreen } from "~/hooks/match-media";
import { Link } from "remix";
import cx from "clsx";
import logoCircleUrl from "~/icons/logo-circle.svg";
import { NavLink } from "~/components/link";
// import type { MenuDir, VersionHead } from "~/utils.server";
import {
  useHeaderNavState,
  useSetBodyHeaderAttributes,
  useSetHeaderHeight,
  useCrappyFocusLock,
} from "~/components/site-header";
import type { NavLinkProps } from "react-router-dom";

const NAV_ITEMS = [
  {
    label: "Documentation",
    to: "/docs",
  },
  {
    label: "Resources",
    to: "/resources",
  },
  {
    label: "GitHub",
    to: "https://github.com/remix-run/react-router",
  },
  {
    label: "npm",
    to: "https://npm.im/react-router",
  },
];

const DocsSiteHeader: React.VFC<{ className?: string }> = ({ className }) => {
  let location = useLocation();
  let isMediumScreen = useMatchScreen("md");
  let [navIsOpen, setNavIsOpen] = useHeaderNavState(false, {
    meetsScreenSizeThreshold: isMediumScreen,
    location,
  });
  let headerRef = React.useRef<HTMLElement>(null);
  let navRef = React.useRef<HTMLElement>(null);
  let handleNavBlur = useCrappyFocusLock({
    enabled: isMediumScreen ? false : navIsOpen,
    containerRef: navRef,
    onBlur: () => {
      setNavIsOpen(false);
    },
  });
  useSetBodyHeaderAttributes();
  useSetHeaderHeight(headerRef);

  return (
    <header
      ref={headerRef}
      className={cx(className, [
        "border-b border-solid",
        "bg-[color:var(--hue-0000)]",
        "py-[25px]",
        "w-full top-0",
        "border-[color:var(--hue-0200)]",
        "z-10",
      ])}
    >
      <div className="flex items-center justify-between px-6 mx-auto max-w-none">
        <Link
          to="/"
          className="flex items-center space-x-4 text-[color:var(--hue-1000)] hover:text-[color:var(--hue-1000)]"
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
          onBlur={handleNavBlur}
          tabIndex={isMediumScreen ? undefined : -1}
          className={cx(
            [
              "sm-down:top-[var(--site-header-height)]",
              "sm-down:left-0 sm-down:right-0",
              // 'w-full md:w-auto',
              "sm-down:absolute",
              "sm-down:h-[fit-content]",
              "sm-down:max-h-[calc(100vh-var(--site-header-height)-env(safe-area-inset-bottom))]",
              "sm-down:z-40",
              "sm-down:p-6",
              "sm-down:border-b sm-down:border-[color:var(--hue-0200)]",
              "sm-down:overflow-scroll",
              "sm-down:bg-[color:var(--hue-0000)]",
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
          <ul className="text-xl md:flex sm-down:space-y-6 md:space-x-8 md:text-base">
            {NAV_ITEMS.map((item) => {
              return (
                <li key={item.label}>
                  <HeaderNavLink to={item.to}>{item.label}</HeaderNavLink>
                </li>
              );
            })}
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
      aria-hidden
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
      aria-hidden
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

export { DocsSiteHeader };

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
            : "text-[color:var(--hue-1000)] hover:text-[color:var(--hue-1000)] opacity-80 hover:opacity-100",
          typeof className === "function" ? className(args) : className
        )
      }
    />
  );
}
