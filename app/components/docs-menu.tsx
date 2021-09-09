import { NavLink, useNavigate, useParams } from "react-router-dom";
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
          className="dark:bg-black dark:border-gray-700 border"
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
              {v.version}
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
  return (
    <ul className="pl-4">
      {dir.dirs &&
        dir.dirs.map((dir, index) => (
          <li key={index}>
            {dir.hasIndex ? (
              <NavLink to={`${linkPrefix}${dir.path}`}>{dir.title}</NavLink>
            ) : (
              <span>{dir.title}</span>
            )}
            <MenuList level={level + 1} dir={dir} />
          </li>
        ))}
      {dir.files.map((file, index) => (
        <li key={index}>
          {file.attributes.disabled ? (
            <span>{file.title} 🚧</span>
          ) : (
            <NavLink to={`${linkPrefix}${file.path}`}>{file.title}</NavLink>
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
