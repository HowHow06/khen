import { useEffect, useState } from "react";

function useDebouncedValue<T>(inputValue: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(inputValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, delay);

    // Cleanup function to clear the timeout if the component unmounts or the inputValue/delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, delay]);

  return debouncedValue;
}

export default useDebouncedValue;
