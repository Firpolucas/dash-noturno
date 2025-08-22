import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, ChevronDown } from "lucide-react";

interface AgentFilterProps {
  agents: string[];
  selectedAgents: string[];
  onAgentsChange: (agents: string[]) => void;
}

export const AgentFilter = ({ agents, selectedAgents, onAgentsChange }: AgentFilterProps) => {
  const handleAgentToggle = (agent: string, checked: boolean) => {
    if (checked) {
      onAgentsChange([...selectedAgents, agent]);
    } else {
      onAgentsChange(selectedAgents.filter(a => a !== agent));
    }
  };

  const handleSelectAll = () => {
    if (selectedAgents.length === agents.length) {
      onAgentsChange([]);
    } else {
      onAgentsChange([...agents]);
    }
  };

  const getDisplayText = () => {
    if (selectedAgents.length === 0) return "Selecionar agentes";
    if (selectedAgents.length === agents.length) return "Todos os agentes";
    if (selectedAgents.length === 1) return selectedAgents[0];
    return `${selectedAgents.length} agentes selecionados`;
  };

  return (
    <div className="flex items-center space-x-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-48 justify-between">
            {getDisplayText()}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                id="select-all"
                checked={selectedAgents.length === agents.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Todos os agentes
              </label>
            </div>
            {agents.map((agent, index) => (
              <div key={`agent-${index}-${agent}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`agent-${index}`}
                  checked={selectedAgents.includes(agent)}
                  onCheckedChange={(checked) => handleAgentToggle(agent, !!checked)}
                />
                <label htmlFor={`agent-${index}`} className="text-sm cursor-pointer">
                  {agent}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};