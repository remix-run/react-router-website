import { NavLink, useNavigation, useParams } from "@remix-run/react";
import classNames from "classnames";
import { VersionSelect } from "./version-select";

export function NavPill() {
  let { ref } = useParams();
  let withRef = (path: string) => (ref ? `/${ref}/${path}` : `/${path}`);

  return (
    <div className="inline-block">
      <div className="flex justify-between bg-gray-100 dark:bg-gray-800 rounded-full">
        <VersionSelect />
        <div className="bg-gray-200 dark:bg-gray-600 w-[1px] mr-2" />
        <Segments>
          <PillLink to={withRef("guides")}>Guides</PillLink>
          <PillLink to={withRef("api")}>API</PillLink>
        </Segments>
      </div>
    </div>
  );
}

function Segments({ children }: { children: React.ReactNode }) {
  return <div className="flex px-1 items-center gap-1">{children}</div>;
}

export function PillLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  let activeClassName = "bg-white dark:bg-black shadow text-red-brand";
  let inActiveClassName =
    "hover:bg-gray-200 dark:hover:bg-gray-700 border-transparent text-gray-500 dark:text-gray-100 hover:border-gray-100 hover:border-b-transparent";
  let navigation = useNavigation();
  let isNavigating = Boolean(navigation.location);

  return (
    <NavLink
      to={to}
      className={({ isActive, isPending }) =>
        classNames(
          "rounded-full p-2 text-sm font-semibold min-w-12 text-center",
          isActive && !isNavigating
            ? activeClassName
            : isPending
            ? activeClassName
            : inActiveClassName
        )
      }
    >
      {children}
    </NavLink>
  );
}
