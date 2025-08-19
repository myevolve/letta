export type LogEntry = {
  id: string;
  timestamp: string;
  agentName: string;
  userInput: string;
  agentResponse: string;
  status: "Success" | "Error" | "In Progress";
};

export const mockLogs: LogEntry[] = [
  {
    id: "log-1",
    timestamp: new Date().toISOString(),
    agentName: "My Awesome Agent",
    userInput: "What's the weather like in London?",
    agentResponse: "I'm sorry, I cannot check the weather.",
    status: "Success",
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    agentName: "Customer Support Bot",
    userInput: "My order is late.",
    agentResponse: "Tool call failed: get_order_details",
    status: "Error",
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    agentName: "My Awesome Agent",
    userInput: "Tell me a joke.",
    agentResponse: "Why don't scientists trust atoms? Because they make up everything!",
    status: "Success",
  },
];
