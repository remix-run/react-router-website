import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NavLink } from "remix";
import type { MenuDir, VersionHead } from "~/utils.server";
import cx from "clsx";

export function MenuVersionSelector({
  version,
  versions,
  className,
}: {
  versions: VersionHead[];
  version: VersionHead;
  className?: string;
}) {
  let navigate = useNavigate();
  let { version: versionInParams, lang } = useParams();
  let isOtherTag = React.useMemo(
    () => !versions.find((v) => v.head === versionInParams),
    [versions, versionInParams]
  );
  return (
    <div className={className}>
      <select
        className="select"
        defaultValue={version.head}
        onChange={(event) => {
          navigate(`/docs/${lang}/${event.target.value}`);
        }}
      >
        {isOtherTag && (
          <option value={versionInParams}>{versionInParams}</option>
        )}
        {versions.map((v) => (
          <option key={v.version} value={v.head}>
            {v.head} ({v.version})
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Used to lookup docs from other docs when we have sibling links (step by step
 * tutorials, etc.)
 */
export type MenuMap = Map<string, MenuDir>;

export function Menu({
  menu,
  className,
}: {
  menu: MenuDir;
  className?: string;
}) {
  return (
    <nav className={cx("md-nav", className)}>
      <div className="">
        <MenuList level={1} dir={menu} />
      </div>
    </nav>
  );
}

function MenuList({ dir, level = 1 }: { dir: MenuDir; level?: number }) {
  let { lang, version } = useParams();
  let linkPrefix = `/docs/${lang}/${version}`;
  let itemClassName = ({ isActive }: { isActive?: boolean } = {}) =>
    cx("md-nav-item py-1 block text-base lg:text-sm", {
      "md-nav-heading": level === 1,
      ["text-[color:var(--base0D)]"]: isActive,
      ["text-[color:inherit]"]: !isActive,
    });

  return (
    <ul
      className={cx("md-nav-list text-[color:var(--base05)] mb-3", {
        ["ml-3 md:ml-4 lg:ml-3 2xl:ml-4"]: level === 3,
        ["ml-6 md:ml-8 lg:ml-6 2xl:ml-8"]: level === 4,
      })}
      data-level={level}
    >
      {dir.dirs &&
        dir.dirs.map((dir, index) => {
          // ignore empty directories
          if (!dir.hasIndex && dir.files.length < 1) {
            return null;
          }
          let dirItemClassName = ({ isActive }: { isActive?: boolean } = {}) =>
            cx(itemClassName({ isActive: level !== 1 && isActive }), {
              // removes top padding from the first item in the first list
              ["pt-0"]: level === 1 && index === 0,
            });
          return (
            <li key={index} data-dir="" data-level={level}>
              {dir.hasIndex ? (
                <NavLink
                  to={`${linkPrefix}${dir.path}`}
                  className={dirItemClassName}
                >
                  {dir.title}
                </NavLink>
              ) : (
                <span className={dirItemClassName()}>{dir.title}</span>
              )}
              <MenuList level={level + 1} dir={dir} />
            </li>
          );
        })}
      {dir.files.map((file, index) => (
        <li key={index} className="" data-file="" data-level={level}>
          {file.attributes.disabled ? (
            <span className={itemClassName()}>{file.title} 🚧</span>
          ) : (
            <NavLink to={`${linkPrefix}${file.path}`} className={itemClassName}>
              {file.title}
            </NavLink>
          )}
        </li>
      ))}
    </ul>
  );
}

export function createMenuMap(dir: MenuDir, map: MenuMap = new Map()) {
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
