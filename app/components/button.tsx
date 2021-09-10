import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import type { LinkProps, NavLinkProps } from "react-router-dom";
import cx from "clsx";

// TODO: Light mode for docs usage

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    let { variant, ...domProps } = props;
    return (
      <button ref={ref} {...domProps} className={getButtonClassNames(props)} />
    );
  }
);

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (props, ref) => {
    let { variant, disabled, ...domProps } = props;
    return (
      <Link
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
    let { variant, disabled, ...domProps } = props;
    return (
      <NavLink
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

Button.displayName = "Button";
ButtonLink.displayName = "ButtonLink";
ButtonNavLink.displayName = "ButtonNavLink";

function getButtonClassNames({
  className,
  variant = "primary",
  disabled = false,
  isActive = false, // for active NavLink styles,
}: {
  className?: string | ((props: { isActive: boolean }) => string);
  variant?: ButtonVariant;
  disabled?: boolean;
  isActive?: boolean;
}) {
  return cx(
    typeof className === "function" ? className({ isActive }) : className,
    `inline-flex items-center font-bold text-base no-underline border-2 rounded ` +
      `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ` +
      `transition-colors duration-200`,
    {
      // primary variant
      [`px-5 py-3 lg:px-6
        bg-blue-500 hover:bg-blue-700
        border-blue-500 hover:border-blue-700
        focus:ring-white
        text-white`]: variant === "primary",

      // secondary variant
      [`px-5 py-3 lg:px-6
        bg-transparent hover:bg-white
        border-white
        focus:ring-blue-700
        text-white hover:text-black`]: variant === "secondary",

      // documentation variant
      [`px-2 py-1
        bg-transparent
        border-transparent
        ${
          isActive
            ? "text-blue-500 hover:text-blue-700"
            : "text-gray-300 hover:text-white"
        }
        focus:ring-blue-500`]: variant === "documentation",

      // all disabled buttons
      ["pointer-events-none opacity-70"]: disabled,
    }
  );
}

// Based on the variants in the designs
type ButtonVariant = "primary" | "secondary" | "documentation";

interface ButtonSharedProps {
  variant?: ButtonVariant;
  disabled?: boolean;
}

interface ButtonProps
  extends React.ComponentPropsWithRef<"button">,
    ButtonSharedProps {}
interface ButtonLinkProps extends LinkProps, ButtonSharedProps {}
interface ButtonNavLinkProps extends NavLinkProps, ButtonSharedProps {}

export type { ButtonProps, ButtonLinkProps, ButtonNavLinkProps };
export { Button, ButtonLink, ButtonNavLink };
