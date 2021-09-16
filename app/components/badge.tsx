import * as React from "react";
import cx from "clsx";

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ children, className, color, ...props }, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        {...props}
        className={cx(
          className,
          `inline-flex items-center rounded-full whitespace-nowrap font-semibold tabular-nums
           h-7 sm:h-8
           text-sm sm:text-base
           leading-[1]
           px-3 sm:px-4
          `,
          {
            "text-blue-500 bg-blue-500/20": color === "blue",
            "text-green-500 bg-green-500/20": color === "green",
          }
        )}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

interface BadgeProps extends Omit<React.ComponentPropsWithRef<"div">, "color"> {
  color: "red" | "green" | "blue" | "yellow";
}

export type { BadgeProps };
export { Badge };
