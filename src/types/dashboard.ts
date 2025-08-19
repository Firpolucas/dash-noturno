export interface AgentData {
  "Mês": string;
  "Volume": string;
  "Satisfação": string;
  "Bom": number;
  "Ruim": number;
  "Jira": number;
  "E-mail": number;
  "Chat": number;
  "Simultâneo Chat": string;
  "Simultâneo s/chat": string;
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