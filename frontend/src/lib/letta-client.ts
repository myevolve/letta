import { LettaClient } from '@letta-ai/letta-client';

const getBaseUrl = () => {
  // In a real app, this would come from an environment variable
  // For example: process.env.NEXT_PUBLIC_LETTA_API_URL
  return 'http://localhost:8283';
};

export const lettaClient = new LettaClient({
  baseUrl: getBaseUrl(),
});
