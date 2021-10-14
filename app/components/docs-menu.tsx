import { useParams } from "react-router-dom";
import { NavLink } from "remix";
import type { MenuNode } from "~/utils.server";
import cx from "clsx";

export function Menu({
  nodes,
  className,
}: {
  nodes: MenuNode[];
  className?: string;
}) {
  return (
    <nav className={cx("md-nav", className)}>
      <MenuList level={1} nodes={nodes} />
    </nav>
  );
}

function MenuList({ nodes, level = 1 }: { nodes: MenuNode[]; level?: number }) {
  let { lang, version } = useParams();
  let linkPrefix = `/docs/${lang}/${version}`;
  let itemClassName = ({ isActive }: { isActive?: boolean } = {}) =>
    cx(
      "md-nav-item py-1 block text-base lg:text-sm",
      `md-nav-item--level-${level}`,
      {
        ["md-nav-item--active"]: isActive,
        "md-nav-heading": level === 1,
      }
    );

  return (
    <ul
      className={cx("md-nav-list text-[color:var(--hue-0750)] mb-3", {
        ["ml-3 md:ml-4 lg:ml-3 2xl:ml-4"]: level === 3,
        ["ml-6 md:ml-8 lg:ml-6 2xl:ml-8"]: level === 4,
      })}
      data-level={level}
    >
      {nodes
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
        .map((node, index) => {
          let dirItemClassName = ({ isActive }: { isActive?: boolean } = {}) =>
            cx(itemClassName({ isActive: level !== 1 && isActive }), {
              ["pt-0"]: level === 1 && index === 0,
            });

          return (
            <li key={node.slug} data-dir="" data-level={level}>
              {node.hasContent ? (
                <NavLink
                  prefetch="intent"
                  end
                  to={`${linkPrefix}${node.slug}`}
                  className={dirItemClassName}
                >
                  {node.title}
                </NavLink>
              ) : (
                <span className={dirItemClassName()}>{node.title}</span>
              )}
              {node.children.length > 0 && (
                <MenuList level={level + 1} nodes={node.children} />
              )}
            </li>
          );
        })}
    </ul>
  );
}
