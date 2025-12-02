import { useEffect, useState, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export const AnimatedNumber = ({ value, className }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Animation State
  useEffect(() => {
    if (value === displayValue) return;

    setPreviousValue(displayValue);
    setDisplayValue(value);
    setIsCollapsing(false);

    // Double requestAnimationFrame ensures transition triggers
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsCollapsing(true);
      });
    });

    // Reset previous value after transition
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPreviousValue(null);
      setIsCollapsing(false);
    }, 3000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, displayValue]);

  return (
    <div className={`inline-flex items-center ${className}`}>
      {previousValue !== null && (
        <div
          style={{ transitionDuration: "2000ms", transitionDelay: "1000ms" }}
          className={`flex items-center overflow-hidden transition-all ease-in-out ${
            isCollapsing ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"
          }`}
        >
          <span className="text-muted-foreground line-through decoration-destructive/50 whitespace-nowrap">
            {previousValue.toFixed(1)}
          </span>
          <ArrowRight className="w-4 h-4 text-muted-foreground mx-1 flex-shrink-0" />
        </div>
      )}

      <span className="font-bold">{displayValue.toFixed(1)}</span>
    </div>
  );
};
