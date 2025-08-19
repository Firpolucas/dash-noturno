export interface AgentData {
  "Mês": string;
  "Volume": string | number;
  "Satisfação": string | number;
  "Bom": number;
  "Ruim": number;
  "Jira": number;
  "E-mail": number;
  "Chat": number;
  "Simultâneo Chat": string | number;
  "Simultâneo s/chat": string | number;
  "Agente": string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export interface ChannelData {
  name: string;
  value: number;
  color: string;
}