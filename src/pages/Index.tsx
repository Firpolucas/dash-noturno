import { useState, useMemo } from "react";
import { Users, MessageSquare, Mail, Ticket, TrendingUp, BarChart3, Upload, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { MetricCard } from "@/components/MetricCard";
import { ChannelChart } from "@/components/ChannelChart";
import { AgentFilter } from "@/components/AgentFilter";
import { MonthFilter } from "@/components/MonthFilter";
import { AgentData } from "@/types/dashboard";

const Index = () => {
  const [data, setData] = useState<AgentData[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedMonthRange, setSelectedMonthRange] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<'individual' | 'grouped'>('individual');
  const [displayedRecords, setDisplayedRecords] = useState<number>(5);

  const agents = useMemo(() => {
    const uniqueAgents = Array.from(
      new Set(
        data
          .map(item => item.Agente)
          .filter(agente => 
            agente && 
            typeof agente === 'string' && 
            agente.trim() !== '' &&
            agente !== 'undefined' &&
            agente !== 'null'
          )
      )
    );
    console.log("Agentes únicos processados:", uniqueAgents);
    console.log("Total de dados após filtragem:", data.length);
    return uniqueAgents;
  }, [data]);

  const availableMonths = useMemo(() => {
    const uniqueMonths = Array.from(
      new Set(
        data
          .map(item => item.Mês)
          .filter(mes => mes && typeof mes === 'string' && mes.trim() !== '')
      )
    );
    return uniqueMonths;
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data;
    
    // Filtrar por agente
    if (selectedAgents.length > 0) {
      filtered = filtered.filter(item => selectedAgents.includes(item.Agente));
    }
    
    // Filtrar por mês
    if (filterMode === 'individual' && selectedMonth) {
      filtered = filtered.filter(item => item.Mês === selectedMonth);
    } else if (filterMode === 'grouped' && selectedMonthRange.length > 0) {
      filtered = filtered.filter(item => selectedMonthRange.includes(item.Mês));
    }
    
    return filtered;
  }, [data, selectedAgents, selectedMonth, selectedMonthRange, filterMode]);

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

    // No modo agrupado, somar os valores; no individual, fazer média
    if (filterMode === 'grouped' && selectedMonthRange.length > 0) {
      // Modo agrupado: somar todos os valores
      const totalVolume = filteredData.reduce((acc, item) => {
        return acc + normalizePercentage(item.Volume);
      }, 0) / filteredData.length; // Média das porcentagens

      const totalSatisfacao = filteredData.reduce((acc, item) => {
        return acc + normalizePercentage(item.Satisfação);
      }, 0) / filteredData.length; // Média das porcentagens

      const totalBom = filteredData.reduce((acc, item) => acc + Number(item.Bom || 0), 0);
      const totalRuim = filteredData.reduce((acc, item) => acc + Number(item.Ruim || 0), 0);

      const chatSimultaneo = filteredData.reduce((acc, item) => {
        return acc + normalizeDecimal(item["Simultâneo Chat"]);
      }, 0) / filteredData.length; // Média

      const simultaneoSemChat = filteredData.reduce((acc, item) => {
        return acc + normalizeDecimal(item["Simultâneo s/chat"]);
      }, 0) / filteredData.length; // Média

      return {
        volume: totalVolume.toFixed(1) + '%',
        satisfacao: totalSatisfacao.toFixed(1) + '%',
        totalBom,
        totalRuim,
        chatSimultaneo: chatSimultaneo.toFixed(2),
        simultaneoSemChat: simultaneoSemChat.toFixed(2)
      };
    } else {
      // Modo individual ou todos os meses: calcular médias
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

      const simultaneoSemChat = filteredData.reduce((acc, item) => {
        return acc + normalizeDecimal(item["Simultâneo s/chat"]);
      }, 0) / filteredData.length;

      return {
        volume: totalVolume.toFixed(1) + '%',
        satisfacao: totalSatisfacao.toFixed(1) + '%',
        totalBom,
        totalRuim,
        chatSimultaneo: chatSimultaneo.toFixed(2),
        simultaneoSemChat: simultaneoSemChat.toFixed(2)
      };
    }
  }, [filteredData, filterMode, selectedMonthRange]);

  const channelData = useMemo(() => {
    if (filteredData.length === 0) return { jira: [], email: [], chat: [], satisfacao: [], simultaneoSemChat: [], agents: [] };

    // Function to normalize percentage values
    const normalizePercentage = (value: string | number): number => {
      if (typeof value === 'number') {
        return value > 1 ? value : value * 100;
      }
      if (typeof value === 'string') {
        return parseFloat(value.replace('%', '').replace(',', '.'));
      }
      return 0;
    };

    // Function to normalize decimal values
    const normalizeDecimal = (value: string | number): number => {
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string') {
        return parseFloat(value.replace(',', '.'));
      }
      return 0;
    };

    // Group data by month and agent
    const monthlyData: { [month: string]: { [agent: string]: { Jira: number; Email: number; Chat: number; Satisfacao: number; SimultaneoSemChat: number } } } = {};
    const agentsSet = new Set<string>();
    
    filteredData.forEach(item => {
      if (item.Agente && item.Mês) {
        const month = item.Mês;
        const agent = item.Agente;
        
        agentsSet.add(agent);
        
        if (!monthlyData[month]) {
          monthlyData[month] = {};
        }
        
        if (!monthlyData[month][agent]) {
          monthlyData[month][agent] = { Jira: 0, Email: 0, Chat: 0, Satisfacao: 0, SimultaneoSemChat: 0 };
        }
        
        monthlyData[month][agent].Jira += Number(item.Jira || 0);
        monthlyData[month][agent].Email += Number(item["E-mail"] || 0);
        monthlyData[month][agent].Chat += Number(item.Chat || 0);
        monthlyData[month][agent].Satisfacao = normalizePercentage(item.Satisfação);
        monthlyData[month][agent].SimultaneoSemChat = normalizeDecimal(item["Simultâneo s/chat"]);
      }
    });

    // Sort months in chronological order
    const MONTH_ORDER = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => 
      MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b)
    );

    const agentsList = Array.from(agentsSet).sort();

    // Create data structure for line charts
    const jiraData = sortedMonths.map(month => {
      const monthData: any = { month };
      agentsList.forEach(agent => {
        monthData[agent] = monthlyData[month]?.[agent]?.Jira || 0;
      });
      return monthData;
    });

    const emailData = sortedMonths.map(month => {
      const monthData: any = { month };
      agentsList.forEach(agent => {
        monthData[agent] = monthlyData[month]?.[agent]?.Email || 0;
      });
      return monthData;
    });

    const chatData = sortedMonths.map(month => {
      const monthData: any = { month };
      agentsList.forEach(agent => {
        monthData[agent] = monthlyData[month]?.[agent]?.Chat || 0;
      });
      return monthData;
    });

    const satisfacaoData = sortedMonths.map(month => {
      const monthData: any = { month };
      agentsList.forEach(agent => {
        monthData[agent] = monthlyData[month]?.[agent]?.Satisfacao || 0;
      });
      return monthData;
    });

    const simultaneoSemChatData = sortedMonths.map(month => {
      const monthData: any = { month };
      agentsList.forEach(agent => {
        monthData[agent] = monthlyData[month]?.[agent]?.SimultaneoSemChat || 0;
      });
      return monthData;
    });

    return {
      jira: jiraData,
      email: emailData,
      chat: chatData,
      satisfacao: satisfacaoData,
      simultaneoSemChat: simultaneoSemChatData,
      agents: agentsList
    };
  }, [filteredData, selectedAgents]);

  const exportToPDF = async () => {
    try {
      const element = document.getElementById('dashboard-content');
      if (!element) return;

      // Scroll to top to ensure full capture
      window.scrollTo(0, 0);
      
      // Wait for any dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Use custom wide format (A2 landscape equivalent)
      const pdf = new jsPDF('l', 'mm', [594, 420]); // Wide landscape format
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit content with better scaling
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const widthRatio = (pdfWidth - 20) / imgWidth; // Leave 10mm margin on each side
      const heightRatio = (pdfHeight - 20) / imgHeight; // Leave 10mm margin top/bottom
      const ratio = Math.min(widthRatio, heightRatio);
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      
      // Center the content
      const imgX = (pdfWidth - scaledWidth) / 2;
      const imgY = (pdfHeight - scaledHeight) / 2;

      // If content is still too tall, split into pages
      if (scaledHeight > pdfHeight - 20) {
        const maxPageHeight = pdfHeight - 30; // Leave margins
        const totalPages = Math.ceil(scaledHeight / maxPageHeight);
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage();
          
          const sourceY = (imgHeight / totalPages) * i;
          const sourceHeight = Math.min(imgHeight / totalPages, imgHeight - sourceY);
          
          // Create canvas for this page section
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = sourceHeight;
          
          const pageCtx = pageCanvas.getContext('2d');
          if (pageCtx) {
            pageCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
            const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
            const pageScaledHeight = sourceHeight * ratio;
            pdf.addImage(pageImgData, 'PNG', imgX, 15, scaledWidth, pageScaledHeight);
          }
        }
      } else {
        pdf.addImage(imgData, 'PNG', imgX, imgY, scaledWidth, scaledHeight);
      }

      pdf.save('dashboard-agentinsight.pdf');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    }
  };

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
      <div id="dashboard-content" className="max-w-7xl mx-auto space-y-6">
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
            <Button 
              onClick={exportToPDF}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button 
              onClick={() => setData([])}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Nova Planilha
            </Button>
            <AgentFilter 
              agents={agents}
              selectedAgents={selectedAgents}
              onAgentsChange={setSelectedAgents}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MonthFilter
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            selectedMonthRange={selectedMonthRange}
            filterMode={filterMode}
            onMonthChange={setSelectedMonth}
            onMonthRangeChange={setSelectedMonthRange}
            onFilterModeChange={setFilterMode}
          />
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <MetricCard
              title="Simultâneo s/chat"
              value={metrics.simultaneoSemChat}
              subtitle="Média"
              trend="neutral"
              icon={<BarChart3 className="h-5 w-5" />}
            />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChannelChart
            data={channelData.jira}
            title="Atendimentos Jira"
            channelType="Jira"
            agents={channelData.agents}
          />
          <ChannelChart
            data={channelData.email}
            title="Atendimentos E-mail"
            channelType="Email"
            agents={channelData.agents}
          />
          <ChannelChart
            data={channelData.chat}
            title="Atendimentos Chat"
            channelType="Chat"
            agents={channelData.agents}
          />
        </div>

        {/* New Charts Row - Satisfaction and Simultâneo s/chat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChannelChart
            data={channelData.satisfacao}
            title="Satisfação por Agente"
            channelType="Satisfacao"
            agents={channelData.agents}
          />
          <ChannelChart
            data={channelData.simultaneoSemChat}
            title="Simultâneo s/chat por Agente"
            channelType="SimultaneoSemChat"
            agents={channelData.agents}
          />
        </div>

        {/* Data Table Preview */}
        {filteredData.length > 0 && (
          <div className="bg-gradient-card shadow-card rounded-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Dados Carregados</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Exibindo {Math.min(displayedRecords, filteredData.length)} de {filteredData.length} registros
                </span>
                <div className="flex gap-2">
                  {displayedRecords < filteredData.length && (
                    <Button
                      onClick={() => setDisplayedRecords(prev => Math.min(prev + 10, filteredData.length))}
                      variant="outline"
                      size="sm"
                    >
                      Mostrar +10
                    </Button>
                  )}
                  {displayedRecords > 5 && (
                    <Button
                      onClick={() => setDisplayedRecords(5)}
                      variant="outline"
                      size="sm"
                    >
                      Mostrar Menos
                    </Button>
                  )}
                  {displayedRecords < filteredData.length && (
                    <Button
                      onClick={() => setDisplayedRecords(filteredData.length)}
                      variant="outline"
                      size="sm"
                    >
                      Mostrar Todos
                    </Button>
                  )}
                </div>
              </div>
            </div>
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
                    <th className="pb-2 font-medium">Simultâneo s/chat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, displayedRecords).map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-2 font-medium">{item.Agente}</td>
                      <td className="py-2">{item.Mês}</td>
                      <td className="py-2">{item.Volume}</td>
                      <td className="py-2">{item.Satisfação}</td>
                      <td className="py-2">{item.Jira}</td>
                      <td className="py-2">{item["E-mail"]}</td>
                      <td className="py-2">{item.Chat}</td>
                      <td className="py-2">{item["Simultâneo s/chat"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;