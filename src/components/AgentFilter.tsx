import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";

interface AgentFilterProps {
  agents: string[];
  selectedAgent: string;
  onAgentChange: (agent: string) => void;
}

export const AgentFilter = ({ agents, selectedAgent, onAgentChange }: AgentFilterProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedAgent} onValueChange={onAgentChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Selecionar agente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os agentes</SelectItem>
          {agents.map((agent, index) => (
            <SelectItem key={`agent-${index}-${agent}`} value={agent}>
              {agent}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};