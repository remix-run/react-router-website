import { Link, useNavigate } from "@remix-run/react";
import iconsHref from "~/icons.svg";
import { ColorSchemeToggle } from "../color-scheme-toggle";
import classNames from "classnames";
import { DocSearch } from "~/modules/docsearch";
import { NavPill } from "../nav-pill";

export function Header() {
  return (
    <div className="relative z-20 flex h-16 w-full items-center justify-between gap-2 border-b border-gray-50 bg-white px-4 text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 lg:px-8">
      <div className="flex w-full items-center gap-2 md:w-auto md:justify-between md:gap-4">
        <LogoLink />
        <div className="flex items-center gap-2">
          <NavPill />
        </div>
      </div>

      <div className="flex gap-2 md:gap-4">
        <DocSearchSection />
        <ColorSchemeToggle />
        <ExternalLinks />
      </div>
    </div>
  );
}

function LogoLink() {
  let navigate = useNavigate();
  return (
    <Link
      to="/"
      className="hidden items-center gap-1 text-gray-900 dark:text-white md:flex"
      onContextMenu={(event) => {
        event.preventDefault();
        navigate("/brand");
      }}
    >
      <svg
        aria-label="React Router logo, nine dots in an upward triangle (one on top, two in the middle, three on the bottom) with a path of three highlighted and connected from top to bottom"
        className="h-14 w-14 md:h-12 md:w-12"
      >
        <use href={`${iconsHref}#logo`} />
      </svg>
      <div className="hidden md:block">
        <svg aria-label="React Router" className="h-6 w-40">
          <use href={`${iconsHref}#logotype`} />
        </svg>
      </div>
    </Link>
  );
}
function ExternalLinks() {
  return (
    <div className="flex items-center gap-4">
      <HeaderSvgLink
        href="https://github.com/remix-run/react-router"
        svgId="github"
        svgLabel="GitHub octocat logo in a circle"
        title="View code on GitHub"
        svgSize="24x24"
      />
      <HeaderSvgLink
        href="https://rmx.as/discord"
        svgId="discord"
        svgLabel="Discord logo in a circle"
        title="Chat on Discord"
        svgSize="24x24"
      />
      <HeaderSvgLink
        href="https://remix.run"
        svgId="remix"
        svgLabel="Stylized text saying “Made by Remix” with an right pointing arrow."
        svgSize="122x17"
      />
    </div>
  );
}

function HeaderSvgLink({
  className = "",
  href,
  svgId,
  svgLabel,
  svgSize,
  title,
}: {
  className?: string;
  href: string;
  svgId: string;
  svgLabel: string;
  svgSize: string;
  title?: string;
}) {
  const [width, height] = svgSize.split("x");

  return (
    <a
      href={href}
      className={classNames(
        `hidden text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 md:block`,
        className
      )}
      title={title}
    >
      <svg
        aria-label={svgLabel}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <use href={`${iconsHref}#${svgId}`} />
      </svg>
    </a>
  );
}

function DocSearchSection() {
  return (
    <div className="lg:bg-white lg:dark:bg-gray-900">
      <DocSearch />
    </div>
  );
}
