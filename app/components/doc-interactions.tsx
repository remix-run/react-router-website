"use client";

import { createContext, use, useRef } from "react";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-markdown-links";
import { useCodeBlockCopyButton } from "~/ui/utils";

const MarkdownRefContext =
  createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export function DocInteractions({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return <MarkdownRefContext value={ref}>{children}</MarkdownRefContext>;
}

export function useMarkdownRef() {
  const ref = use(MarkdownRefContext);
  if (!ref) throw new Error("Expected DocInteractions around Markdown content");
  return ref;
}

export function MarkdownContent({ children }: { children: React.ReactNode }) {
  const ref = useMarkdownRef();
  useDelegatedReactRouterLinks(ref);
  useCodeBlockCopyButton(ref);

  return (
    <div ref={ref} className="markdown w-full max-w-3xl pb-[33vh]">
      {children}
    </div>
  );
}
