import { useLocation } from "react-router";
import { useEffect, useState } from "react";

let hydrating = true;

export function useHydrated() {
  let [hydrated, setHydrated] = useState(() => !hydrating);
  useEffect(() => {
    hydrating = false;
    setHydrated(true);
  }, []);
  return hydrated;
}

export function useCodeBlockCopyButton(ref: React.RefObject<HTMLElement>) {
  let location = useLocation();
  useEffect(() => {
    let container = ref.current;
    if (!container) return;

    let codeBlocks = container.querySelectorAll(
      "[data-code-block][data-lang]:not([data-nocopy])"
    );
    let buttons = new Map<
      HTMLButtonElement,
      { listener: (event: MouseEvent) => void; to: number }
    >();

    for (const codeBlock of codeBlocks) {
      let button = document.createElement("button");
      let label = document.createElement("span");
      button.type = "button";
      button.dataset.codeBlockCopy = "";
      button.addEventListener("click", listener);

      label.textContent = "Copy code to clipboard";
      label.classList.add("sr-only");
      button.appendChild(label);
      codeBlock.appendChild(button);
      buttons.set(button, { listener, to: -1 });

      function listener(event: MouseEvent) {
        event.preventDefault();
        let pre = codeBlock.querySelector("pre");
        let text = pre?.textContent;
        if (!text) return;
        navigator.clipboard
          .writeText(text)
          .then(() => {
            button.dataset.copied = "true";
            let to = window.setTimeout(() => {
              window.clearTimeout(to);
              if (button) {
                button.dataset.copied = undefined;
              }
            }, 3000);
            if (buttons.has(button)) {
              buttons.get(button)!.to = to;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
    return () => {
      for (let [button, props] of buttons) {
        button.removeEventListener("click", props.listener);
        button.parentElement?.removeChild(button);
        window.clearTimeout(props.to);
      }
    };
  }, [ref, location.pathname]);
}
