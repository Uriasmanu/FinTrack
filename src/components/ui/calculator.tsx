import { useState, useCallback, useEffect } from "react";
import { Calculator as CalculatorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CalculatorProps {
  onApply: (value: number) => void;
  initialValue?: number;
}

export function Calculator({ onApply, initialValue = 0 }: CalculatorProps) {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const evaluateExpression = useCallback((expr: string): number | null => {
    try {
      const sanitized = expr.replace(/[^0-9+\-*/().]/g, "");
      if (!sanitized) return null;
      const fn = new Function(`return (${sanitized})`);
      const value = fn();
      if (typeof value !== "number" || !Number.isFinite(value)) return null;
      return Math.round(value * 100) / 100;
    } catch {
      return null;
    }
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && initialValue > 0) {
      const initial = String(initialValue);
      setExpression(initial);
      setResult(initialValue.toFixed(2));
    } else if (!newOpen) {
      setExpression("");
      setResult(null);
    }
    setOpen(newOpen);
  };

  const handleButton = (value: string) => {
    setExpression((prev) => {
      const newExpr = prev + value;
      const evaluated = evaluateExpression(newExpr);
      setResult(evaluated !== null ? evaluated.toFixed(2) : null);
      return newExpr;
    });
  };

  const handleClear = () => {
    setExpression("");
    setResult(null);
  };

  const handleBackspace = () => {
    setExpression((prev) => {
      const newExpr = prev.slice(0, -1);
      const evaluated = evaluateExpression(newExpr);
      setResult(evaluated !== null ? evaluated.toFixed(2) : null);
      return newExpr;
    });
  };

  const handleApply = () => {
    const evaluated = evaluateExpression(expression);
    if (evaluated !== null && evaluated > 0) {
      onApply(evaluated);
      setExpression("");
      setResult(null);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      if (key >= "0" && key <= "9") {
        e.preventDefault();
        handleButton(key);
      } else if (["+", "-", "*", "/"].includes(key)) {
        e.preventDefault();
        handleButton(key);
      } else if (key === "(" || key === ")") {
        e.preventDefault();
        handleButton(key);
      } else if (key === ".") {
        e.preventDefault();
        handleButton(".");
      } else if (key === "Enter") {
        e.preventDefault();
        handleApply();
      } else if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, expression, handleApply, handleBackspace, handleButton]);

  const buttons = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "(", ")"],
    ["+", "C", "⌫", "="],
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          title="Abrir calculadora"
        >
          <CalculatorIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>Calculadora</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-right bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground h-4 truncate font-mono">
              {expression || "0"}
            </div>
            <div className="text-2xl font-semibold font-mono">
              {result ?? "0"}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {buttons.map((row, rowIdx) =>
              row.map((btn) => (
                <Button
                  key={`${rowIdx}-${btn}`}
                  type="button"
                  variant={btn === "C" ? "destructive" : btn === "=" ? "default" : "outline"}
                  size="sm"
                  className="h-10 text-sm font-mono"
                  onClick={() => {
                    if (btn === "C") handleClear();
                    else if (btn === "⌫") handleBackspace();
                    else if (btn === "=") handleApply();
                    else handleButton(btn);
                  }}
                >
                  {btn}
                </Button>
              ))
            )}
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={handleApply}
            disabled={!result || parseFloat(result) <= 0}
          >
            Aplicar {result ? `R$ ${result}` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
