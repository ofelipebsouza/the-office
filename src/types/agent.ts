export type AgentStatus = "idle" | "working" | "thinking" | "chatting" | "meeting" | "offline";

export type RoomId = "recepcao" | "operacao" | "reuniao" | "lounge" | "diretoria";

export interface ChatMessage {
  sender: "user" | "agent";
  text: string;
  timestamp: string; // ISO String
}

export interface VirtualAgent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  position: {
    x: number;
    y: number;
  };
  targetPosition: {
    x: number;
    y: number;
  } | null;
  deskPosition: {
    x: number;
    y: number;
  };
  color: string; // Theme color (e.g. hex or tailwind class)
  avatarAsset: string;
  currentTask?: string;
  bio: string;
  skills: string[];
  recentLogs: string[];
  chatHistory: ChatMessage[];
  room: RoomId;
}

export interface OfficeRoom {
  id: RoomId;
  name: string;
  description: string;
  centerPos: { x: number; y: number };
}
