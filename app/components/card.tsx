import * as React from "react";
import cx from "clsx";

function Card({ children, className, ...props }: CardProps) {
  return (
    <div {...props} className={className}>
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
    <div
      {...props}
      className={cx(
        className,
        "aspect-w-1 aspect-h-1 rounded-lg overflow-hidden mb-4 sm:mb-5 md:mb-6 xl:mb-8"
      )}
    >
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
