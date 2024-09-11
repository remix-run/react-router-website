import { useEffect, useState } from "react";

export function useDelayedValue<T>(value: T, threshold = 100) {
  let [delayedValue, setDelayedValue] = useState<T>(value);

  useEffect(() => {
    let id = setTimeout(() => {
      setDelayedValue(value);
    }, threshold);
    return () => clearTimeout(id);
  }, [value, threshold]);

  return delayedValue;
}
