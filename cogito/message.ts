import { ChatCompletionRequestMessageRoleEnum } from "npm:openai";

export const systemMessage = (content: string) => ({
  role: ChatCompletionRequestMessageRoleEnum.System,
  content,
});
export const userMessage = (content: string) => ({
  role: ChatCompletionRequestMessageRoleEnum.User,
  content,
});
export const functionMessage = (name: string, content: string) => ({
  name,
  role: ChatCompletionRequestMessageRoleEnum.Function,
  content,
});
