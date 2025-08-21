import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartData {
  name: string;
  value: number;
}

interface ChannelChartProps {
  data: ChartData[];
  title: string;
  channelType: 'Email' | 'Chat' | 'Jira';
}

export const ChannelChart = ({ data, title, channelType }: ChannelChartProps) => {
  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'Email':
        return "hsl(var(--accent))";
      case 'Chat':
        return "hsl(var(--secondary))";
      case 'Jira':
        return "hsl(var(--primary))";
      default:
        return "hsl(var(--primary))";
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
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
            <Bar 
              dataKey="value" 
              fill={getChannelColor(channelType)}
              name={channelType === 'Email' ? 'E-mail' : channelType}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};