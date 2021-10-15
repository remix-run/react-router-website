import * as React from "react";
import { useThrottle } from "use-throttle";

export let colorMap = {
  aqua: "#D5F3F1",
  green: "#BFF3C6",
  pink: "#F9AAE0",
  red: "#FF8287",
  yellow: "#FFEAAA",
  blue: "#92B6E0",
};

let defaultColors: FixedLengthArray<keyof typeof colorMap, 5> = [
  "aqua",
  "green",
  "pink",
  "red",
  "yellow",
];

export function useLogoAnimation(): [FixedLengthArray<string, 5>, () => void] {
  let [colors, setColors] = React.useState(defaultColors);
  let throttled = useThrottle(colors, 250);

  let changeColors = React.useCallback(() => {
    setColors(
      (colors) => colors.slice(0).sort((a, b) => Math.random() - 0.5) as any
    );
  }, []);

  return [throttled.map((key) => colorMap[key]) as any, changeColors];
}

interface FixedLengthArray<T extends any, L extends number> extends Array<T> {
  0: T;
  length: L;
}
