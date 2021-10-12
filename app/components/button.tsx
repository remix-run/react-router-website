import * as React from "react";
import { Link, NavLink } from "remix";
import type { LinkProps, NavLinkProps } from "react-router-dom";
import cx from "clsx";

// TODO: Light mode for docs usage

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    let { variant, size, rounded, ...domProps } = props;
    return (
      <button ref={ref} {...domProps} className={getButtonClassNames(props)} />
    );
  }
);

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (props, ref) => {
    let { variant, size, disabled, rounded, ...domProps } = props;
    return (
      <Link
        prefetch="intent"
        ref={ref}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        {...domProps}
        className={getButtonClassNames(props)}
      />
    );
  }
);

const ButtonAnchor = React.forwardRef<HTMLAnchorElement, ButtonAnchorProps>(
  (props, ref) => {
    let { variant, size, disabled, rounded, ...domProps } = props;
    return (
      <a
        ref={ref}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        {...domProps}
        className={getButtonClassNames(props)}
      />
    );
  }
);

const ButtonNavLink = React.forwardRef<HTMLAnchorElement, ButtonNavLinkProps>(
  (props, ref) => {
    let { variant, size, disabled, rounded, ...domProps } = props;
    return (
      <NavLink
        prefetch="intent"
        ref={ref}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        {...domProps}
        className={({ isActive }) =>
          getButtonClassNames({ ...props, isActive })
        }
      />
    );
  }
);

/**
 * `ButtonDiv` should be used only when something is semantically not a button
 * but needs to look like one. It does not add a role or any aria props.
 */
const ButtonDiv = React.forwardRef<HTMLDivElement, ButtonDivProps>(
  (props, ref) => {
    let { variant, size, disabled, rounded, ...domProps } = props;
    return (
      <div
        ref={ref}
        {...domProps}
        className={cx(
          props.className,
          "cursor-default",
          getButtonClassNames(props).replace(/\s+[\S+]?hover:[\S]+\b/g, "")
        )}
      />
    );
  }
);

Button.displayName = "Button";
ButtonAnchor.displayName = "ButtonAnchor";
ButtonLink.displayName = "ButtonLink";
ButtonNavLink.displayName = "ButtonNavLink";
ButtonDiv.displayName = "ButtonDiv";

function getButtonClassNames({
  className,
  variant = "primary",
  disabled = false,
  isActive = false, // for active NavLink styles,
  rounded,
  size = "base",
}: {
  className?: string | ((props: { isActive: boolean }) => string);
  variant?: ButtonVariant;
  disabled?: boolean;
  isActive?: boolean;
  size?: ButtonSize;
  rounded?: boolean;
}) {
  return cx(
    typeof className === "function" ? className({ isActive }) : className,
    `inline-flex items-center justify-center font-bold no-underline ` +
      `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ` +
      // TODO: Don't add transtion states until after hydration to avoid FOUC
      `transition-colors duration-200`,
    {
      // primary variant
      [`px-5 py-3 lg:px-6
        bg-blue-500 hover:bg-blue-600
        border-2 border-blue-500 hover:border-blue-700
        focus:ring-blue-500
        focus:ring-opacity-60
        text-white hover:text-white`]: variant === "primary",

      // secondary variant
      [`px-5 py-3 lg:px-6
        bg-transparent hover:bg-[color:var(--hue-1000)]
        border-2 border-[color:var(--hue-0750)] hover:border-[color:var(--hue-1000)]
        focus:ring-blue-500
        focus:ring-opacity-60
        text-[color:var(--hue-0750)] hover:text-[color:var(--hue-0000)]`]:
        variant === "secondary",

      // transparent variant
      [`px-5 py-3 lg:px-6
        focus:ring-blue-500
        focus:ring-opacity-60
        text-[color:var(--hue-0750)] hover:text-[color:var(--hue-1000)]`]:
        variant === "transparent",

      // documentation variant
      [`px-2 py-1
        bg-transparent
        border-2 border-transparent
        ${
          isActive
            ? "text-blue-500 hover:text-blue-700"
            : "text-gray-300 hover:text-[color:var(--hue-0100)]"
        }
        focus:ring-blue-500
        focus:ring-opacity-60`]: variant === "documentation",

      "text-sm": size === "small",
      "text-base": size === "base",
      "text-xl": size === "large",

      // all disabled buttons
      "pointer-events-none opacity-70": disabled,

      rounded: !rounded,
      "rounded-full": rounded,
    }
  )
    .replace(/\s+/g, " ")
    .trim();
}

// Based on the variants in the designs
type ButtonVariant = "primary" | "secondary" | "transparent" | "documentation";
type ButtonSize = "small" | "base" | "large";

interface ButtonSharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  rounded?: boolean;
}

interface ButtonProps
  extends React.ComponentPropsWithRef<"button">,
    ButtonSharedProps {}
interface ButtonDivProps
  extends React.ComponentPropsWithRef<"div">,
    ButtonSharedProps {}
interface ButtonLinkProps extends LinkProps, ButtonSharedProps {}
interface ButtonAnchorProps
  extends React.ComponentPropsWithRef<"a">,
    ButtonSharedProps {}
interface ButtonNavLinkProps extends NavLinkProps, ButtonSharedProps {}

export type {
  ButtonProps,
  ButtonAnchorProps,
  ButtonLinkProps,
  ButtonNavLinkProps,
  ButtonDivProps,
};
export { Button, ButtonAnchor, ButtonLink, ButtonNavLink, ButtonDiv };
