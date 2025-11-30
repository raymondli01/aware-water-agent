import { useEffect, useState, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export const AnimatedNumber = ({ value, className }: AnimatedNumberProps) => {
  // State Management
  const [displayValue, setDisplayValue] = useState(value);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Animation Lifecycle
  useEffect(() => {
    if (value === displayValue) return;

    setPreviousValue(displayValue);
    setDisplayValue(value);
    setIsExiting(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Schedule exit animation after delay
    const exitDelay = setTimeout(() => {
      setIsExiting(true);
    }, 2000);

    // Reset animation state after transition
    timeoutRef.current = setTimeout(() => {
      setPreviousValue(null);
      setIsExiting(false);
    }, 3000);

    return () => {
      clearTimeout(exitDelay);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value]);

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Animated Previous Value with Arrow */}
      {previousValue !== null && (
        <div
          className={`flex items-center overflow-hidden transition-all duration-1000 ease-in-out ${
            isExiting ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"
          }`}
        >
          <span className="text-muted-foreground line-through decoration-destructive/50 whitespace-nowrap">
            {previousValue.toFixed(1)}
          </span>
          <ArrowRight className="w-4 h-4 text-muted-foreground mx-1 flex-shrink-0" />
        </div>
      )}

      {/* Current Value Display */}
      <span className="font-bold">{displayValue.toFixed(1)}</span>
    </div>
  );
};
