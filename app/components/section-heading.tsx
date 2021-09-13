import * as React from "react";

const LevelContext: React.Context<HeadingLevel> = React.createContext(
  1 as HeadingLevel
);

function useHeadingLevelContext() {
  return React.useContext(LevelContext);
}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ as: asProp, wrap = false, children, ...props }, ref) => {
    const shouldWrap = Boolean(asProp || wrap);
    const Wrapper = shouldWrap ? asProp || "section" : React.Fragment;
    const level = useHeadingLevelContext();
    const ctx = React.useMemo(
      () => Math.min(level + 1, 6) as HeadingLevel,
      [level]
    );

    return (
      <Wrapper {...(shouldWrap ? ({ ref, ...props } as any) : null)}>
        <LevelContext.Provider value={ctx}>{children}</LevelContext.Provider>
      </Wrapper>
    );
  }
);

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: asProp, level: levelProp, ...props }, ref) => {
    const level = useHeadingLevelContext();
    const className = asProp || `h${levelProp ? levelProp : level}`;
    const Comp: React.ElementType = asProp
      ? asProp === "title"
        ? "h1"
        : asProp
      : (`h${levelProp ? levelProp : level}` as "h2");

    return (
      <Comp
        ref={ref}
        {...props}
        className={[className, props.className].filter(Boolean).join(" ")}
      />
    );
  }
);

interface HeadingProps extends React.ComponentPropsWithRef<"h1"> {
  level?: HeadingLevel;
  as?: "title" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

interface SectionProps extends React.ComponentPropsWithRef<"div"> {
  wrap?: boolean;
  as?: "section" | "div";
}

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type { SectionProps, HeadingProps };
export { Section, Heading, useHeadingLevelContext };
