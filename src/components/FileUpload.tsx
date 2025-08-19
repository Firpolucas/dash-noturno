import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AgentData } from "@/types/dashboard";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onDataLoad: (data: AgentData[]) => void;
}

export const FileUpload = ({ onDataLoad }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo JSON válido.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as AgentData[];
        onDataLoad(data);
        toast({
          title: "Dados carregados com sucesso!",
          description: `${data.length} registro(s) processado(s).`,
        });
      } catch (error) {
        toast({
          title: "Erro no arquivo",
          description: "Não foi possível processar o arquivo JSON.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
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
            Selecione um arquivo JSON com os dados dos agentes
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
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </Card>
  );
};