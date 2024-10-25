import classNames from "classnames";
import * as React from "react";
import { Form, useLocation } from "@remix-run/react";
import { useColorScheme } from "~/modules/color-scheme/components";
import iconsHref from "~/icons.svg";
import { DetailsMenu } from "~/modules/details-menu";
import { DetailsPopup } from "./details-popup";

export function ColorSchemeToggle() {
  let location = useLocation();

  // This is the same default, hover, focus style as the VersionSelect
  const className =
    "border border-transparent bg-gray-100 hover:bg-gray-200 focus:border focus:border-gray-100 focus:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:border-gray-400 dark:focus:bg-gray-700";

  return (
    <DetailsMenu className="relative cursor-pointer">
      <summary
        className={`_no-triangle focus:border-200 flex h-[40px] w-[40px] items-center justify-center rounded-full ${className}`}
      >
        <svg className="hidden h-[24px] w-[24px] dark:inline">
          <use href={`${iconsHref}#moon`} />
        </svg>
        <svg className="h-[24px] w-[24px] dark:hidden">
          <use href={`${iconsHref}#sun`} />
        </svg>
      </summary>
      <DetailsPopup className="right-0 w-40">
        <Form replace action="/color-scheme" method="post" preventScrollReset>
          <input
            type="hidden"
            name="returnTo"
            value={location.pathname + location.search}
          />
          <ColorSchemeButton
            svgId="sun"
            label="Light"
            value="light"
            name="colorScheme"
          />
          <ColorSchemeButton
            svgId="moon"
            label="Dark"
            value="dark"
            name="colorScheme"
          />
          <ColorSchemeButton
            svgId="setting"
            label="System"
            value="system"
            name="colorScheme"
          />
        </Form>
      </DetailsPopup>
    </DetailsMenu>
  );
}

let ColorSchemeButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button"> & { svgId: string; label: string }
>(({ svgId, label, ...props }, forwardedRef) => {
  let colorScheme = useColorScheme();
  return (
    <button
      {...props}
      ref={forwardedRef}
      disabled={colorScheme === props.value}
      className={classNames(
        "flex w-full items-center gap-4 px-4 py-1",
        colorScheme === props.value
          ? "text-red-brand"
          : "hover:bg-gray-50 active:text-red-brand dark:hover:bg-gray-700 dark:active:text-red-brand"
      )}
    >
      <svg className="h-[18px] w-[18px]">
        <use href={`${iconsHref}#${svgId}`} />
      </svg>{" "}
      {label}
    </button>
  );
});

ColorSchemeButton.displayName = "ColorSchemeButton";
