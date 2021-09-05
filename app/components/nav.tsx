import * as React from "react";
import { useLocation, useNavigate, useParams, NavLink } from "react-router-dom";
import { Link } from "remix";
import clsx from "clsx";

// should we preload?
import logoCircleUrl from "~/icons/logo-circle.svg";
import type { MenuDir, VersionHead } from "~/utils.server";
import { useOutletContext } from "./data-outlet";

interface NavProps {
  menu: MenuDir;
  versions: VersionHead[];
  version: VersionHead;
  forceDarkMode: boolean;
}

const Nav: React.VFC<NavProps> = ({
  menu,
  version,
  versions,
  forceDarkMode,
}) => {
  let [navIsOpen, setNavIsOpen] = React.useState(false);
  let location = useLocation();

  React.useEffect(() => {
    if (navIsOpen) {
      document.body.setAttribute("data-nav-open", "");
    } else {
      document.body.removeAttribute("data-nav-open");
    }
  }, [navIsOpen]);

  React.useEffect(() => {
    setNavIsOpen(false);
  }, [location]);

  return (
    <>
      <header
        className={clsx(
          "border-b border-solid flex items-center justify-between px-6 py-[25px]",
          forceDarkMode
            ? "border-[#313131]"
            : "border-[#dbdbdb] dark:border-[#313131]"
        )}
      >
        <Link
          to="/"
          className={clsx(
            "flex items-center space-x-4",
            forceDarkMode ? "text-white" : "text-[#121212] dark:text-white"
          )}
        >
          <svg className="w-9 h-9">
            <use href={`${logoCircleUrl}#logo-circle`} />
          </svg>
          <span className="text-3xl font-bold font-display">React Router</span>
        </Link>
        <button
          id="nav-toggle"
          className="block md:hidden"
          onClick={() => setNavIsOpen((old) => !old)}
        >
          {navIsOpen ? <Close /> : <Hamburger />}
        </button>
        <ul className="hidden space-x-8 md:flex">
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "text-[#3992FF] font-medium"
                  : clsx(
                      "text-[#121212] text-opacity-80 opacity-70 font-semibold",
                      forceDarkMode
                        ? "text-white/80 opacity-70"
                        : "text-[#121212] dark:text-white dark:text-white/80 dark:opacity-70"
                    )
              }
              to="/docs"
            >
              Documentation
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "text-[#3992FF] font-medium"
                  : clsx(
                      "text-opacity-80 opacity-70 font-semibold",
                      forceDarkMode
                        ? "text-white"
                        : "text-[#121212] dark:text-white"
                    )
              }
              to="/resources"
            >
              Resources
            </NavLink>
          </li>
          <li>
            <a
              className={clsx(
                "text-opacity-80 opacity-70 font-semibold",
                forceDarkMode ? "text-white" : "text-[#121212] dark:text-white"
              )}
              href="https://github.com/remix-run/react-router"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              className={clsx(
                "text-opacity-80 opacity-70 font-semibold",
                forceDarkMode ? "text-white" : "text-[#121212] dark:text-white"
              )}
              href="https://npm.im/react-router"
            >
              NPM
            </a>
          </li>
        </ul>
      </header>
      <div className="" data-open={navIsOpen ? "" : null}>
        <nav className="hidden">
          <Menu menu={menu} version={version} versions={versions} />
        </nav>
      </div>
    </>
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
      <path fill="#121212" d="M0 0h20v2H0zM0 6h20v2H0zM0 12h20v2H0z" />
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
      <path fill="#121212" d="M4 18L18.142 3.858l1.414 1.414L5.414 19.414z" />
      <path fill="#121212" d="M5 4l14.142 14.142-1.414 1.414L3.586 5.414z" />
    </svg>
  );
}

const Menu: React.VFC<Omit<NavProps, "forceDarkMode">> = ({
  menu,
  version,
  versions,
}) => {
  let navigate = useNavigate();
  let params = useParams();
  let isOtherTag = !versions.find((v) => v.head === params.version);

  return (
    <nav aria-label="Site">
      <div data-docs-version-wrapper>
        <select
          data-docs-version-select
          defaultValue={version.head}
          onChange={(event) => {
            navigate(`/docs/${params.lang}/${event.target.value}`);
          }}
        >
          {isOtherTag && (
            <option value={params.version}>{params.version}</option>
          )}
          {versions.map((v) => (
            <option key={v.head} value={v.head}>
              {v.head}
            </option>
          ))}
        </select>
      </div>
      <MenuList level={1} dir={menu} />
    </nav>
  );
};

interface MenuListProps {
  dir: MenuDir;
  level?: number;
}

const MenuList: React.VFC<MenuListProps> = ({ dir, level = 1 }) => {
  const { lang, version } = useParams();
  const linkPrefix = `/docs/${lang}/${version}`;
  return (
    <ul data-docs-menu data-level={level}>
      {dir.dirs &&
        dir.dirs.map((dir, index) => (
          <li data-docs-dir data-level={level} key={index}>
            {dir.hasIndex ? (
              <NavLink data-docs-link to={`${linkPrefix}${dir.path}`}>
                {dir.title}
              </NavLink>
            ) : (
              <span data-docs-label>{dir.title}</span>
            )}
            <MenuList level={level + 1} dir={dir} />
          </li>
        ))}
      {dir.files.map((file, index) => (
        <li data-docs-file key={index}>
          {file.attributes.disabled ? (
            <span data-docs-label data-docs-disabled-file>
              {file.title} 🚧
            </span>
          ) : (
            <NavLink data-docs-link to={`${linkPrefix}${file.path}`}>
              {file.title}
            </NavLink>
          )}
        </li>
      ))}
    </ul>
  );
};

export type MenuMap = Map<string, MenuDir>;

function createMenuMap(dir: MenuDir, map: MenuMap = new Map()) {
  for (let file of dir.files) {
    map.set(file.path, dir);
  }
  if (dir.dirs) {
    for (let childDir of dir.dirs) {
      createMenuMap(childDir, map);
    }
  }
  return map;
}

export { Nav, createMenuMap };
