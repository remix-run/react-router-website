import iconsHref from "~/icons.svg";
import { useDoc } from "~/hooks/use-doc";
import { DetailsMenu } from "~/modules/details-menu";
import { Menu } from "./menu";

export function NavMenuMobile({ children }: { children?: React.ReactNode }) {
  let doc = useDoc();

  return (
    <DetailsMenu className="group relative flex h-full flex-col lg:hidden ">
      <summary
        tabIndex={0}
        className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          <svg aria-hidden className="hidden h-5 w-5 group-open:block">
            <use href={`${iconsHref}#chevron-d`} />
          </svg>
          <svg aria-hidden className="h-5 w-5 group-open:hidden">
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
        </div>
        <div className="whitespace-nowrap font-bold">
          {doc ? doc.attrs.title : "Navigation"}
        </div>
      </summary>
      <div className="absolute h-[66vh] w-full overflow-auto overscroll-contain border-b bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-900 dark:shadow-black">
        {children}
        <Menu />
      </div>
    </DetailsMenu>
  );
}
