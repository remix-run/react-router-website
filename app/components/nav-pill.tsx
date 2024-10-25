import { NavLink, useNavigation, useParams } from "@remix-run/react";
import classNames from "classnames";
import { VersionSelect } from "./version-select";
import { useHeaderData } from "./docs-header/use-header-data";

export function NavPill() {
  let { ref } = useParams();
  let withRef = (path: string) => (ref ? `/${ref}/${path}` : `/${path}`);

  let { isV7 } = useHeaderData();

  return (
    <div className="inline-block">
      {isV7 ? (
        <div className="flex justify-between rounded-full bg-gray-100 dark:bg-gray-800">
          <VersionSelect />
          <div className="mr-2 w-[1px] bg-gray-200 dark:bg-gray-600" />
          <Segments>
            <PillLink to={withRef("guides")}>Guides</PillLink>
            <PillLink to={withRef("api")}>API</PillLink>
          </Segments>
        </div>
      ) : (
        <VersionSelect independent />
      )}
    </div>
  );
}

function Segments({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1 px-1">{children}</div>;
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
          "min-w-12 rounded-full p-2 text-center text-sm font-semibold",
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
