import * as React from "react";
import cx from "clsx";

function Container(props: React.ComponentPropsWithoutRef<"div">) {
  return <div {...props} className={cx(props.className, "container")} />;
}

export { Container };
