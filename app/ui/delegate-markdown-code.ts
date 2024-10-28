import React from "react";
import { useLocation } from "@remix-run/react";

// Function to copy the code block content to the clipboard
const copyHandler = (event: MouseEvent) => {
  const copyButton = event.currentTarget as HTMLButtonElement;
  const codeDiv = copyButton.parentElement;
  if (!codeDiv) return;

  const codeText = codeDiv.querySelector("code")?.innerText || "";
  navigator.clipboard.writeText(codeText).then(
    () => {
      const originalText = copyButton.innerText;
      copyButton.innerText = "Copied";

      setTimeout(() => {
        copyButton.innerText = originalText;
      }, 1000);
    },
    (err) => {
      console.error("Failed to copy code: ", err);
    }
  );
};

// Create a copy button inside a pre tag
const createCopyButton = (parentElement: HTMLElement) => {
  const copyButton = document.createElement("button");
  copyButton.innerText = "Copy";
  copyButton.style.position = "absolute";
  copyButton.style.top = "5px";
  copyButton.style.right = "5px";
  copyButton.style.zIndex = "1";
  copyButton.style.backgroundColor = "#f0f0f0";
  copyButton.style.border = "none";
  copyButton.style.cursor = "pointer";
  copyButton.style.padding = "5px";
  copyButton.style.borderRadius = "5px";
  copyButton.style.fontSize = "12px";

  copyButton.addEventListener("click", copyHandler);
  parentElement.appendChild(copyButton);
};

function useDelegateMarkdownCode(nodeRef: React.RefObject<HTMLElement>) {
  let location = useLocation();

  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const codeContainers: NodeListOf<HTMLElement> =
      node.querySelectorAll("pre");

    // Create a copy button for each pre tag
    codeContainers.forEach((code) => {
      code.style.position = "relative";
      createCopyButton(code);
    });

    return () => {
      codeContainers.forEach((code) => {
        const copyButton = code.querySelector("button");
        if (copyButton) {
          copyButton.removeEventListener("click", copyHandler);
          code.removeChild(copyButton);
        }
      });
    };
  }, [nodeRef, location]);
}

export { useDelegateMarkdownCode };
