export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
  sources?: string[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: "biography" | "project" | "skill" | "education";
  embedding?: number[];
  similarity?: number;
}
