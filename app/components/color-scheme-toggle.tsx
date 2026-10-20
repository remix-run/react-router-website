"use client";

import { clsx } from "clsx";
import * as React from "react";
import { useFormStatus } from "react-dom";
import { setColorScheme } from "~/actions/color-scheme/actions";
import {
  applyColorScheme,
  useColorScheme,
} from "~/actions/color-scheme/components";
import { getColorScheme } from "~/actions/color-scheme/utils";
import iconsHref from "~/icons.svg";
import { DetailsMenu } from "~/modules/details-menu";
import { DetailsPopup } from "./details-popup";

export function ColorSchemeToggle() {
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
        <form
          action={setColorScheme}
          onSubmit={(event) => {
            // Switch themes immediately rather than waiting for the server
            let formData = new FormData(
              event.currentTarget,
              event.nativeEvent.submitter,
            );
            let colorScheme = getColorScheme(formData);
            if (colorScheme) applyColorScheme(colorScheme);
          }}
        >
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
        </form>
      </DetailsPopup>
    </DetailsMenu>
  );
}

let ColorSchemeButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button"> & { svgId: string; label: string }
>(({ svgId, label, ...props }, forwardedRef) => {
  let { data } = useFormStatus();
  let savedColorScheme = useColorScheme();
  let colorScheme = (data && getColorScheme(data)) || savedColorScheme;
  return (
    <button
      {...props}
      ref={forwardedRef}
      disabled={colorScheme === props.value}
      className={clsx(
        "flex w-full items-center gap-4 px-4 py-1",
        colorScheme === props.value
          ? "text-red-brand"
          : "hover:bg-gray-50 active:text-red-brand dark:hover:bg-gray-700 dark:active:text-red-brand",
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
