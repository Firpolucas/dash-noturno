import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AgentData } from "@/types/dashboard";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onDataLoad: (data: AgentData[]) => void;
}

export const FileUpload = ({ onDataLoad }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isJson = file.type === "application/json" || file.name.endsWith('.json');

    if (!isExcel && !isJson) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo JSON, XLS ou XLSX válido.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data: AgentData[];

        if (isExcel) {
          // Processar arquivo Excel
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet) as AgentData[];
        } else {
          // Processar arquivo JSON
          data = JSON.parse(e.target?.result as string) as AgentData[];
        }

        if (data.length === 0) {
          throw new Error("Arquivo vazio");
        }

        // Limpar e validar dados
        const cleanedData = data
          .map(item => ({
            ...item,
            // Garantir que Agente seja sempre uma string válida
            Agente: typeof item.Agente === 'string' && item.Agente.trim() 
              ? item.Agente.trim() 
              : String(item.Agente || '').trim() || 'Agente Desconhecido'
          }))
          .filter(item => 
            // Filtrar apenas registros com agente válido (não vazio e não "Agente Desconhecido")
            item.Agente && 
            item.Agente !== 'Agente Desconhecido' && 
            item.Agente !== 'undefined' &&
            item.Agente !== 'null'
          );

        if (cleanedData.length === 0) {
          throw new Error("Nenhum registro válido encontrado");
        }

        // Debug: log dos dados limpos
        console.log("Dados originais:", data.length);
        console.log("Dados limpos:", cleanedData.length);
        console.log("Agentes únicos encontrados:", [...new Set(cleanedData.map(item => item.Agente))]);

        onDataLoad(cleanedData);
        toast({
          title: "Dados carregados com sucesso!",
          description: `${data.length} registro(s) processado(s).`,
        });
      } catch (error) {
        toast({
          title: "Erro no arquivo",
          description: "Não foi possível processar o arquivo. Verifique o formato dos dados.",
          variant: "destructive",
        });
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <Card className="p-8 border-dashed border-2 border-muted hover:border-primary transition-colors duration-200 bg-gradient-card shadow-card">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-4 rounded-full bg-primary/10">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Carregar Dados</h3>
          <p className="text-muted-foreground text-sm">
            Selecione um arquivo JSON, XLS ou XLSX com os dados dos agentes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity">
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </label>
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".json,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </Card>
  );
};