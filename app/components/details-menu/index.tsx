import { useLocation } from "@remix-run/react";
import * as React from "react";

/**
 * An enhanced `<details>` component that's intended to be used as a menu (a bit
 * like a menu-button).
 */
export let DetailsMenu = React.forwardRef<
  HTMLDetailsElement,
  React.ComponentPropsWithRef<"details">
>((props, forwardedRef) => {
  let { onToggle, onMouseDown, onTouchStart, onFocus, open, ...rest } = props;
  let [isOpen, setIsOpen] = React.useState(false);
  let location = useLocation();
  let clickRef = React.useRef<boolean>(false);
  let focusRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [location]); // eslint-disable-line

  React.useEffect(() => {
    if (isOpen) {
      let clickHandler = () => {
        if (!clickRef.current) setIsOpen(false);
        clickRef.current = false;
      };
      let focusHandler = () => {
        if (!focusRef.current) setIsOpen(false);
        focusRef.current = false;
      };
      document.addEventListener("mousedown", clickHandler);
      document.addEventListener("touchstart", clickHandler);
      document.addEventListener("focusin", focusHandler);
      return () => {
        document.removeEventListener("mousedown", clickHandler);
        document.removeEventListener("touchstart", clickHandler);
        document.removeEventListener("focusin", focusHandler);
      };
    }
  }, [isOpen]);

  return (
    <details
      ref={forwardedRef}
      open={open ?? isOpen}
      onToggle={(event) => {
        onToggle && onToggle(event);
        if (event.defaultPrevented) return;
        setIsOpen(event.currentTarget.open);
      }}
      onMouseDown={(event) => {
        onMouseDown && onMouseDown(event);
        if (event.defaultPrevented) return;
        if (isOpen) clickRef.current = true;
      }}
      onTouchStart={(event) => {
        onTouchStart && onTouchStart(event);
        if (event.defaultPrevented) return;
        if (isOpen) clickRef.current = true;
      }}
      onFocus={(event) => {
        onFocus && onFocus(event);
        if (event.defaultPrevented) return;
        if (isOpen) focusRef.current = true;
      }}
      {...rest}
    />
  );
});

DetailsMenu.displayName = "DetailsMenu";
