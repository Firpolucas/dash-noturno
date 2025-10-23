import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartData {
  month: string;
  [agent: string]: number | string;
}

interface ChannelChartProps {
  data: ChartData[];
  title: string;
  channelType: 'Email' | 'Chat' | 'Jira' | 'Satisfacao' | 'SimultaneoSemChat' | 'Desempenho' | 'Volume';
  agents: string[];
}

export const ChannelChart = ({ data, title, channelType, agents }: ChannelChartProps) => {
  const getAgentColor = (agent: string) => {
    const colors: { [key: string]: string } = {
      'João': '#dc2626', // Red
      'Daiane': '#ec4899', // Pink
      'Ana': '#eab308', // Yellow
      'Felipe': '#2563eb', // Blue
      'Líder': '#a3662c' // Brown
    };
    return colors[agent] || 'hsl(var(--primary))';
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-card)"
              }}
            />
            <Legend />
            {agents.map((agent) => (
              <Line
                key={agent}
                type="monotone"
                dataKey={agent}
                stroke={getAgentColor(agent)}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={agent}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};