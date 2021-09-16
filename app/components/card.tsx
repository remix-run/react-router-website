import * as React from "react";
import cx from "clsx";

function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cx(className, "grid grid-cols-1 grid-rows-[repeat(2,auto)] gap-8")}
    >
      {children}
    </div>
  );
}

function CardImage({ children, className, ...props }: CardImageProps) {
  let {
    props: { className: childClassName },
  } = children || { props: {} };
  // TODO: This should be a responsive square, I think.
  return (
    <div {...props} className={cx(className, "rounded-lg overflow-hidden")}>
      {children &&
        React.cloneElement(children, {
          className: cx(childClassName, "object-cover object-center", {
            "w-full": !(childClassName && /\bw-[\d]/g.test(childClassName)),
            "h-full": !(childClassName && /\bh-[\d]/g.test(childClassName)),
          }),
        })}
    </div>
  );
}

function CardContent({ children, ...props }: CardContentProps) {
  return <div {...props}>{children}</div>;
}

interface CardProps extends React.ComponentPropsWithoutRef<"div"> {}
interface CardContentProps extends React.ComponentPropsWithoutRef<"div"> {}
interface CardImageProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  children: Omit<
    React.DOMElement<React.ComponentPropsWithRef<"img">, HTMLImageElement>,
    "ref"
  >;
}

export { Card, CardImage, CardContent };
export type { CardProps, CardImageProps };
