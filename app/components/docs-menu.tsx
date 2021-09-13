import { useNavigate, useParams } from "react-router-dom";
import { NavLink } from "remix";
import type { MenuDir, VersionHead } from "~/utils.server";

/**
 * Used to lookup docs from other docs when we have sibling links (step by step
 * tutorials, etc.)
 */
export type MenuMap = Map<string, MenuDir>;

export function Menu({
  menu,
  version,
  versions,
}: {
  menu: MenuDir;
  versions: VersionHead[];
  version: VersionHead;
}) {
  let navigate = useNavigate();
  let params = useParams();
  let isOtherTag = !versions.find((v) => v.head === params.version);

  return (
    <nav className="p-4">
      <div className="m-4">
        <select
          className="select dark:bg-black dark:border-gray-700 border"
          defaultValue={version.head}
          onChange={(event) => {
            navigate(`/docs/${params.lang}/${event.target.value}`);
          }}
        >
          {isOtherTag && (
            <option value={params.version}>{params.version}</option>
          )}
          {versions.map((v) => (
            <option key={v.version} value={v.head}>
              {v.head} ({v.version})
            </option>
          ))}
        </select>
      </div>
      <MenuList level={1} dir={menu} />
    </nav>
  );
}

function MenuList({ dir, level = 1 }: { dir: MenuDir; level?: number }) {
  let { lang, version } = useParams();
  let linkPrefix = `/docs/${lang}/${version}`;
  let sharedItemClassName = "px-4 py-1 block";
  if (level === 1) sharedItemClassName += " font-bold";

  return (
    <ul className={level === 2 ? "mb-4" : ""}>
      {dir.dirs &&
        dir.dirs.map((dir, index) => (
          <li className="pl-4" key={index}>
            {dir.hasIndex ? (
              <NavLink
                to={`${linkPrefix}${dir.path}`}
                className={sharedItemClassName}
              >
                {dir.title}
              </NavLink>
            ) : (
              <span
                className={`text-[color:var(--base05)] ${sharedItemClassName}`}
              >
                {dir.title}
              </span>
            )}
            <MenuList level={level + 1} dir={dir} />
          </li>
        ))}
      {dir.files.map((file, index) => (
        <li key={index} className="pl-4">
          {file.attributes.disabled ? (
            <span className={sharedItemClassName}>{file.title} 🚧</span>
          ) : (
            <NavLink
              to={`${linkPrefix}${file.path}`}
              className={sharedItemClassName}
            >
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
