// TODO: YOU ARE HERE
// iOS is reporting a bad length, might need to find a better way to measure it?

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

////////////////////////////////////////////////////////////////////////////////
interface TStageProps {
  frame: number;
  length: number;
  children: React.ReactNode;
  DEBUG?: boolean;
}

interface TActorProps {
  type?: "progress" | "frame";
  start: number;
  end?: number;
  persistent?: boolean;
  children: React.ReactNode;
}

interface TScrollStageProps {
  pages: number;
  fallbackFrame?: number;
  fallbackLength?: number;
  children: React.ReactNode;
  DEBUG?: boolean;
}

interface TFrame {
  frame: number;
  progress: number;
  length: number;
}

////////////////////////////////////////////////////////////////////////////////
let StageContext = createContext<TFrame>({
  frame: 0,
  progress: 0,
  length: 0,
});

let ActorContext = createContext<TFrame>({
  frame: 0,
  progress: 0,
  length: 0,
});

////////////////////////////////////////////////////////////////////////////////
export let Stage = ({ frame, length, DEBUG, children }: TStageProps) => {
  let progress = frame / length;
  let context = useMemo(() => {
    let context: TFrame = { frame, progress, length };
    return context;
  }, [frame, progress, length]);
  if (DEBUG) console.log(context);
  return <StageContext.Provider value={context} children={children} />;
};

export let Actor = ({
  type = "progress",
  start: startProp,
  end: endProp,
  persistent = false,
  children,
}: TActorProps) => {
  let stage = useContext(StageContext);

  let start = type === "progress" ? startProp * stage.length : startProp;
  let end = endProp
    ? type === "progress"
      ? endProp * stage.length
      : endProp
    : stage.length;

  let length = end - start;
  let frame = stage.frame - start;
  let progress = Math.max(0, Math.min(frame / length, 1));

  let context = useMemo(() => {
    let context: TFrame = { frame, progress, length };
    return context;
  }, [frame, progress, length]);

  let onStage = persistent
    ? true
    : stage.frame >= start && (endProp ? stage.frame < end : true);

  return onStage ? (
    <ActorContext.Provider value={context} children={children} />
  ) : null;
};

export let ScrollStage = ({
  pages,
  fallbackFrame = 0,
  fallbackLength = 1080,
  DEBUG = false,
  children,
}: TScrollStageProps) => {
  let ref = useRef<HTMLDivElement>(null);
  let relativeScroll = useRelativeWindowScroll(ref, fallbackFrame);
  // let getLength = () => document.documentElement.clientHeight * pages;
  let getLength = () => window.innerHeight * pages;
  let hydrated = useHydrated();
  let [length, setLength] = useState<number>(() => {
    return hydrated ? getLength() : fallbackLength;
  });

  // set length after server render
  useEffect(() => setLength(getLength()), []);
  useOnResize(useCallback(() => setLength(getLength()), [pages]));

  return (
    <Stage
      frame={Math.max(0, Math.min(relativeScroll, length))}
      length={length}
      DEBUG={DEBUG}
    >
      <div ref={ref} style={{ height: `${pages * 100}vh` }}>
        {children}
      </div>
    </Stage>
  );
};

////////////////////////////////////////////////////////////////////////////////
export function useActor(): TFrame {
  return useContext(ActorContext);
}

export function useStage(): TFrame {
  return useContext(StageContext);
}

let hydrated = false;
function useHydrated() {
  useEffect(() => {
    hydrated = true;
  });
  return hydrated;
}

export function useOnResize(fn: () => void) {
  useEffect(() => {
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [fn]);
}

export function useWindowScroll(fallback: number = 0): number {
  let [scroll, setScroll] = useState<number>(
    typeof window === "undefined" ? fallback : window.scrollY
  );
  let handleScroll = useCallback(() => {
    setScroll(window.scrollY);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useOnResize(handleScroll);

  return scroll;
}

export function useRelativeWindowScroll(
  ref: React.RefObject<HTMLElement>,
  fallback: number = 0
): number {
  let windowScroll = useWindowScroll(fallback);
  if (!ref.current) return fallback;
  return (
    // windowScroll - ref.current.offsetTop + document.documentElement.clientHeight
    windowScroll - ref.current.offsetTop + window.innerHeight
    // windowScroll - ref.current.offsetTop
  );
}
