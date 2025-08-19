import { useState, useMemo } from "react";
import { Users, MessageSquare, Mail, Ticket, TrendingUp, BarChart3 } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { MetricCard } from "@/components/MetricCard";
import { ChannelChart } from "@/components/ChannelChart";
import { AgentFilter } from "@/components/AgentFilter";
import { AgentData, ChannelData } from "@/types/dashboard";

const Index = () => {
  const [data, setData] = useState<AgentData[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("todos");

  const agents = useMemo(() => {
    const uniqueAgents = Array.from(new Set(data.map(item => item.Agente)));
    console.log("Agentes únicos processados:", uniqueAgents);
    console.log("Total de dados:", data.length);
    return uniqueAgents;
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedAgent === "todos") return data;
    return data.filter(item => item.Agente === selectedAgent);
  }, [data, selectedAgent]);

  const metrics = useMemo(() => {
    if (filteredData.length === 0) return null;

    // Função helper para normalizar valores de porcentagem
    const normalizePercentage = (value: string | number): number => {
      if (typeof value === 'number') {
        // Se já é número, assumir que pode estar em decimal (0.947) ou inteiro (94.7)
        return value > 1 ? value : value * 100;
      }
      if (typeof value === 'string') {
        // Se é string, remover % e vírgulas, converter para número
        return parseFloat(value.replace('%', '').replace(',', '.'));
      }
      return 0;
    };

    // Função helper para normalizar valores decimais
    const normalizeDecimal = (value: string | number): number => {
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string') {
        return parseFloat(value.replace(',', '.'));
      }
      return 0;
    };

    const totalVolume = filteredData.reduce((acc, item) => {
      return acc + normalizePercentage(item.Volume);
    }, 0) / filteredData.length;

    const totalSatisfacao = filteredData.reduce((acc, item) => {
      return acc + normalizePercentage(item.Satisfação);
    }, 0) / filteredData.length;

    const totalBom = filteredData.reduce((acc, item) => acc + Number(item.Bom || 0), 0);
    const totalRuim = filteredData.reduce((acc, item) => acc + Number(item.Ruim || 0), 0);

    const chatSimultaneo = filteredData.reduce((acc, item) => {
      return acc + normalizeDecimal(item["Simultâneo Chat"]);
    }, 0) / filteredData.length;

    return {
      volume: totalVolume.toFixed(1) + '%',
      satisfacao: totalSatisfacao.toFixed(1) + '%',
      totalBom,
      totalRuim,
      chatSimultaneo: chatSimultaneo.toFixed(2)
    };
  }, [filteredData]);

  const channelData: ChannelData[] = useMemo(() => {
    if (filteredData.length === 0) return [];

    const totalJira = filteredData.reduce((acc, item) => acc + Number(item.Jira || 0), 0);
    const totalEmail = filteredData.reduce((acc, item) => acc + Number(item["E-mail"] || 0), 0);
    const totalChat = filteredData.reduce((acc, item) => acc + Number(item.Chat || 0), 0);

    console.log("Channel data debug:", { totalJira, totalEmail, totalChat });

    return [
      { name: "Jira", value: totalJira, color: "hsl(var(--primary))" },
      { name: "E-mail", value: totalEmail, color: "hsl(var(--accent))" },
      { name: "Chat", value: totalChat, color: "hsl(var(--secondary))" }
    ];
  }, [filteredData]);

  const feedbackData: ChannelData[] = useMemo(() => {
    if (!metrics) return [];

    return [
      { name: "Positivos", value: metrics.totalBom, color: "hsl(var(--metric-positive))" },
      { name: "Negativos", value: metrics.totalRuim, color: "hsl(var(--metric-negative))" }
    ];
  }, [metrics]);

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AgentInsight Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Painel de desempenho de agentes de suporte
            </p>
          </div>
          <FileUpload onDataLoad={setData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AgentInsight Dashboard
            </h1>
            <p className="text-muted-foreground">
              Acompanhe o desempenho dos agentes de suporte
            </p>
          </div>
          <div className="flex items-center gap-4">
            <AgentFilter 
              agents={agents}
              selectedAgent={selectedAgent}
              onAgentChange={setSelectedAgent}
            />
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Volume de Atendimento"
              value={metrics.volume}
              trend="positive"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <MetricCard
              title="Satisfação"
              value={metrics.satisfacao}
              trend="positive"
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              title="Feedbacks Positivos"
              value={metrics.totalBom}
              subtitle={`${metrics.totalRuim} negativos`}
              trend="positive"
              icon={<MessageSquare className="h-5 w-5" />}
            />
            <MetricCard
              title="Chat Simultâneo"
              value={metrics.chatSimultaneo}
              subtitle="Média"
              trend="neutral"
              icon={<BarChart3 className="h-5 w-5" />}
            />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChannelChart
            data={channelData}
            title="Atendimentos por Canal"
          />
          <ChannelChart
            data={feedbackData}
            title="Feedback dos Clientes"
          />
        </div>

        {/* Data Table Preview */}
        {filteredData.length > 0 && (
          <div className="bg-gradient-card shadow-card rounded-lg p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">Dados Carregados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-2 font-medium">Agente</th>
                    <th className="pb-2 font-medium">Mês</th>
                    <th className="pb-2 font-medium">Volume</th>
                    <th className="pb-2 font-medium">Satisfação</th>
                    <th className="pb-2 font-medium">Jira</th>
                    <th className="pb-2 font-medium">E-mail</th>
                    <th className="pb-2 font-medium">Chat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 5).map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-2 font-medium">{item.Agente}</td>
                      <td className="py-2">{item.Mês}</td>
                      <td className="py-2">{item.Volume}</td>
                      <td className="py-2">{item.Satisfação}</td>
                      <td className="py-2">{item.Jira}</td>
                      <td className="py-2">{item["E-mail"]}</td>
                      <td className="py-2">{item.Chat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 5 && (
                <p className="text-muted-foreground text-center mt-4">
                  E mais {filteredData.length - 5} registro(s)...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;