import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, BarChart3 } from "lucide-react";

interface MonthFilterProps {
  availableMonths: string[];
  selectedMonth: string | null;
  selectedMonthRange: string[];
  filterMode: 'individual' | 'grouped';
  onMonthChange: (month: string | null) => void;
  onMonthRangeChange: (months: string[]) => void;
  onFilterModeChange: (mode: 'individual' | 'grouped') => void;
}

const MONTH_ORDER = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const MonthFilter = ({
  availableMonths,
  selectedMonth,
  selectedMonthRange,
  filterMode,
  onMonthChange,
  onMonthRangeChange,
  onFilterModeChange
}: MonthFilterProps) => {
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');

  // Ordenar meses disponíveis pela ordem natural
  const sortedMonths = availableMonths.sort((a, b) => {
    const indexA = MONTH_ORDER.indexOf(a);
    const indexB = MONTH_ORDER.indexOf(b);
    return indexA - indexB;
  });

  const handleRangeApply = () => {
    if (rangeStart && rangeEnd) {
      const startIndex = MONTH_ORDER.indexOf(rangeStart);
      const endIndex = MONTH_ORDER.indexOf(rangeEnd);
      
      if (startIndex <= endIndex) {
        const rangeMonths = MONTH_ORDER.slice(startIndex, endIndex + 1)
          .filter(month => availableMonths.includes(month));
        onMonthRangeChange(rangeMonths);
      }
    }
  };

  const clearFilters = () => {
    onMonthChange(null);
    onMonthRangeChange([]);
    setRangeStart('');
    setRangeEnd('');
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Filtro por Mês
        </h3>
        <div className="flex gap-2">
          <Button
            variant={filterMode === 'individual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterModeChange('individual')}
          >
            Individual
          </Button>
          <Button
            variant={filterMode === 'grouped' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterModeChange('grouped')}
            className="flex items-center gap-1"
          >
            <BarChart3 className="h-3 w-3" />
            Agrupado
          </Button>
        </div>
      </div>

      {filterMode === 'individual' ? (
        <div className="space-y-2">
          <Select value={selectedMonth || 'all'} onValueChange={(value) => onMonthChange(value === 'all' ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {sortedMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Select value={rangeStart} onValueChange={setRangeStart}>
              <SelectTrigger>
                <SelectValue placeholder="Mês inicial" />
              </SelectTrigger>
              <SelectContent>
                {sortedMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rangeEnd} onValueChange={setRangeEnd}>
              <SelectTrigger>
                <SelectValue placeholder="Mês final" />
              </SelectTrigger>
              <SelectContent>
                {sortedMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRangeApply}
              disabled={!rangeStart || !rangeEnd}
              size="sm"
            >
              Aplicar Período
            </Button>
            {selectedMonthRange.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar
              </Button>
            )}
          </div>
          
          {selectedMonthRange.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Período selecionado: {selectedMonthRange.join(', ')}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};