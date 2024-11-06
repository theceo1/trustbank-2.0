import { Button } from '@/components/ui/button';

interface TimeframeSelectorProps {
  timeframes: string[];
  active: string;
  onChange: (timeframe: string) => void;
}

export function TimeframeSelector({ timeframes, active, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {timeframes.map((timeframe) => (
        <Button
          key={timeframe}
          variant={active === timeframe ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(timeframe)}
        >
          {timeframe}
        </Button>
      ))}
    </div>
  );
}