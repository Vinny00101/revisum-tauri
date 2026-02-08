import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useState, useEffect } from "react";

interface OrderInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showPositionIndicator?: boolean;
}

export default function OrderInput({
  label = "Ordem de Exibição",
  value,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
  placeholder = "Digite a ordem",
  className = "",
  showPositionIndicator = true,
}: OrderInputProps) {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || "");

  // Sincroniza quando o valor externo muda
  useEffect(() => {
    setInputValue(value?.toString() || "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Permite campo vazio temporariamente
    if (rawValue === "") {
      setInputValue("");
      return;
    }

    // Remove caracteres não numéricos
    const numericValue = rawValue.replace(/\D/g, "");
    
    if (numericValue === "") {
      setInputValue("");
      return;
    }

    let num = parseInt(numericValue, 10);
    
    // Aplica limites
    if (num < min) num = min;
    if (max !== undefined && num > max) num = max;
    
    setInputValue(num.toString());
    
    // Notifica o componente pai apenas quando o valor é válido
    if (!isNaN(num) && num >= min && (max === undefined || num <= max)) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    // Se o campo ficar vazio, restaura o valor anterior
    if (inputValue === "") {
      setInputValue(value?.toString() || min.toString());
      onChange(value || min);
    }
  };

  const increment = () => {
    if (disabled) return;
    const newValue = Math.min((value || min) + 1, max || 999);
    onChange(newValue);
  };

  const decrement = () => {
    if (disabled) return;
    const newValue = Math.max((value || min) - 1, min);
    onChange(newValue);
  };

  return (
     <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex flex-col">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Define a ordem que este conteúdo aparecerá
          </span>
        </div>
      )}
      
      <div className="relative group">
        {/* Input principal */}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-28 rounded-lg base-input font-medium text-center transition-all duration-200 focus:outline-none"
          aria-label={label}
        />

        {/* Botões na direita */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col h-[calc(100%-0.5rem)] w-10">
          {/* Botão de incremento - TOPO */}
          <button
            type="button"
            onClick={increment}
            disabled={disabled || (max !== undefined && (value || min) >= max)}
            className="flex-1 flex items-center justify-center rounded-t-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 group/increment"
            aria-label="Aumentar ordem"
            title="Aumentar (↑)"
          >
            <ArrowBigUp size={15} />
          </button>

          {/* Divisor sutil */}
          <div className="h-px bg-gray-300 dark:bg-gray-600" />

          {/* Botão de decremento - BASE */}
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || (value || min) <= min}
            className="flex-1 flex items-center justify-center rounded-b-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 group/decrement"
            aria-label="Diminuir ordem"
            title="Diminuir (↓)"
          >
            <ArrowBigDown size={15}/>
          </button>
        </div>

        {/* Indicador visual de posição à esquerda */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Posição</span>
          </div>
        </div>
      </div>

      {/* Informações e feedback */}
      {showPositionIndicator && (
        <div className="space-y-2">
          {/* Barra de progresso visual */}
          <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
              style={{ 
                width: `${Math.min(100, ((value || min) / (max || 100)) * 100)}%` 
              }}
            />
          </div>

          {/* Texto informativo */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">
              Atualmente: <span>Posição #{value || min}</span>
            </span>
            
            <div className="flex items-center space-x-1">
              <span className="text-gray-500">de</span>
              <span className="font-semibold text-gray-500">{max || "∞"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}