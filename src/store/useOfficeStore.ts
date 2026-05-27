import { create } from "zustand";
import type { VirtualAgent, RoomId, AgentStatus, OfficeRoom } from "../types/agent";

interface OfficeState {
  agents: VirtualAgent[];
  rooms: OfficeRoom[];
  selectedAgentId: string | null;
  selectedRoomId: RoomId | null;
  
  // Camera State
  cameraAutoFocus: boolean;
  triggerCameraReset: number;

  // Chat State
  isChatOpen: boolean;
  
  // Actions
  selectAgent: (id: string | null) => void;
  selectRoom: (id: RoomId | null) => void;
  setCameraAutoFocus: (enabled: boolean) => void;
  resetCamera: () => void;
  setChatOpen: (open: boolean) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  updateAgentPosition: (id: string, pos: { x: number; y: number }) => void;
  setAgentTargetPosition: (id: string, targetPos: { x: number; y: number } | null) => void;
  addChatMessage: (agentId: string, sender: "user" | "agent", text: string) => void;
  addAgentLog: (agentId: string, log: string) => void;
  triggerAgentMove: (agentId: string, targetRoomId: RoomId) => void;
  tickSimulation: () => void;
}

const INITIAL_ROOMS: OfficeRoom[] = [
  { id: "recepcao", name: "Recepção", description: "Entrada principal, atendimento e recepção de clientes.", centerPos: { x: 504, y: 200 } },
  { id: "operacao", name: "Operação Central", description: "Área ampla de desenvolvimento, design e análise de dados.", centerPos: { x: 820, y: 360 } },
  { id: "diretoria", name: "Diretoria", description: "Gabinete executivo de decisões estratégicas e reuniões de negócios.", centerPos: { x: 1100, y: 440 } },
  { id: "reuniao", name: "Sala de Reunião", description: "Ambiente reservado para brainstormings e alinhamentos semanais.", centerPos: { x: 568, y: 490 } },
  { id: "lounge", name: "Lounge & Café", description: "Café moderno e sofás confortáveis para socialização e descanso.", centerPos: { x: 728, y: 570 } }
];

const INITIAL_AGENTS: VirtualAgent[] = [
  {
    id: "1",
    name: "Sarah Silva",
    role: "CEO & AI Strategist",
    status: "working",
    deskPosition: { x: 1088, y: 488 },
    position: { x: 1088, y: 488 },
    targetPosition: null,
    color: "#ec4899", // Pink
    avatarAsset: "ceo",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    currentTask: "Modelando roadmap de arquitetura multiagente para Q3",
    bio: "Lidera a visão estratégica e alocação de recursos de inteligência do escritório virtual. Especialista em identificar oportunidades de mercado e conectar fluxos complexos.",
    skills: ["Strategic Planning", "Resource Optimization", "Multi-Agent System Design", "SaaS Growth"],
    recentLogs: [
      "[INFO] Analisando relatórios trimestrais de throughput das APIs...",
      "[SYSTEM] Conectando agent_financeiro a agent_dev para cruzamento de custos...",
      "[INFO] Roadmap de Q3: Iniciando rascunho de migração de microsserviços."
    ],
    chatHistory: [
      { sender: "agent", text: "Olá! Sou a Sarah, CEO e Estrategista aqui na corporação. Como posso te auxiliar na coordenação operacional hoje?", timestamp: new Date().toISOString() }
    ],
    room: "diretoria"
  },
  {
    id: "2",
    name: "Amanda Costa",
    role: "Customer Success Agent",
    status: "idle",
    deskPosition: { x: 472, y: 168 },
    position: { x: 472, y: 168 },
    targetPosition: null,
    color: "#3b82f6", // Blue
    avatarAsset: "support",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    currentTask: "Respondendo tickets de alta prioridade na fila do suporte",
    bio: "Interage diretamente com usuários, resolve problemas e monitora o nível de satisfação em tempo real. Sempre atenciosa, ágil e focada em NPS elevado.",
    skills: ["User Relations", "Sentiment Analysis", "Ticket Resolution", "CRM Integration"],
    recentLogs: [
      "[LOG] Ticket #2048 atualizado: Resolvido atraso de sincronização de webhook.",
      "[WARN] Alerta de sentimento negativo detectado em conta premium corporativa.",
      "[LOG] Iniciando chatbot de triagem automatizada com 94% de acerto."
    ],
    chatHistory: [
      { sender: "agent", text: "Oi! Amanda por aqui. Seus clientes estão felizes e a fila de chamados está sob controle. Precisa de algum dado?", timestamp: new Date().toISOString() }
    ],
    room: "recepcao"
  },
  {
    id: "3",
    name: "Lucas Lima",
    role: "Lead UI/UX Designer",
    status: "working",
    deskPosition: { x: 792, y: 264 },
    position: { x: 792, y: 264 },
    targetPosition: null,
    color: "#a855f7", // Purple
    avatarAsset: "designer",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    currentTask: "Iterando no layout da dashboard corporativa com glassmorphism",
    bio: "Garante que a interface e a experiência de usuário sejam impecáveis, intuitivas e esteticamente deslumbrantes. Especialista em micro-animações.",
    skills: ["Figma Design", "User Flow Mapping", "Visual Aesthetics", "Design Systems"],
    recentLogs: [
      "[FIGMA] Componente 'DashboardCard' atualizado no design system global.",
      "[UX] Testando contraste de cores de acordo com diretrizes WCAG AAA.",
      "[RENDER] Exportando novos assets SVG limpos para a biblioteca PixiJS."
    ],
    chatHistory: [
      { sender: "agent", text: "E aí! Acabei de refinar as sombras e o glow neon dos cards do mapa. O que achou do visual dark?", timestamp: new Date().toISOString() }
    ],
    room: "operacao"
  },
  {
    id: "4",
    name: "Enzo Santos",
    role: "Senior Backend Developer",
    status: "working",
    deskPosition: { x: 920, y: 328 },
    position: { x: 920, y: 328 },
    targetPosition: null,
    color: "#10b981", // Green
    avatarAsset: "developer",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    currentTask: "Otimizando indexação de busca vetorial em banco de dados de alta densidade",
    bio: "Escreve código limpo, otimiza consultas de banco de dados e cria APIs de alta performance. Adora hoodies e café forte.",
    skills: ["Node.js", "TypeScript", "PostgreSQL", "API Architectures", "Docker"],
    recentLogs: [
      "[DB] query_time: 14ms em busca de similaridade de embeddings (redução de 80%).",
      "[VITE] Recompilando módulos quentes (HMR) concluído com sucesso.",
      "[API] Novo endpoint '/api/v1/agents/state' implantado e validado."
    ],
    chatHistory: [
      { sender: "agent", text: "Fala dev! Escrevendo código de alta concorrência por aqui. Sem bugs nas minhas queries hoje, felizmente.", timestamp: new Date().toISOString() }
    ],
    room: "operacao"
  },
  {
    id: "5",
    name: "Carla Souza",
    role: "Data Analyst & BI",
    status: "thinking",
    deskPosition: { x: 728, y: 360 },
    position: { x: 728, y: 360 },
    targetPosition: null,
    color: "#f59e0b", // Amber
    avatarAsset: "analyst",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    currentTask: "Processando logs de comportamento dos agentes para extração de eficiência",
    bio: "Processa volumes massivos de dados, cria gráficos elegantes e extrai insights acionáveis que moldam o desenvolvimento de IA do produto.",
    skills: ["Python", "Pandas", "SQL", "Tableau", "Data Mining"],
    recentLogs: [
      "[PANDAS] DataFrame carregado: 1.2M logs processados com sucesso.",
      "[BI] Gráficos de dispersão de latência vs custo gerados para reunião executiva.",
      "[MODEL] Modelo de regressão linear treinado para previsão de consumo de tokens."
    ],
    chatHistory: [
      { sender: "agent", text: "Olá! Estava cruzando os dados de performance de chat dos agentes. O índice de engajamento subiu 22%.", timestamp: new Date().toISOString() }
    ],
    room: "operacao"
  },
  {
    id: "6",
    name: "Rodrigo Melo",
    role: "CFO & FinOps Manager",
    status: "working",
    deskPosition: { x: 856, y: 424 },
    position: { x: 856, y: 424 },
    targetPosition: null,
    color: "#ef4444", // Red
    avatarAsset: "finance",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    currentTask: "Ajustando alocação de créditos na AWS e OpenAI para conter estouros",
    bio: "Controla as finanças, otimiza os custos de infraestrutura em nuvem e garante o ROI positivo de todas as operações automatizadas.",
    skills: ["Financial Planning", "Cost Control", "Cloud Billing Optimization", "Auditing"],
    recentLogs: [
      "[FIN] Custos de tokens de LLM reduzidos em 18% usando cache semântico.",
      "[AWS] Desligando instâncias EC2 ociosas de sandbox para economizar recursos.",
      "[BUDGET] Relatório mensal finalizado: Economia líquida de R$12.400."
    ],
    chatHistory: [
      { sender: "agent", text: "Saudações financeiras. Economizei mais R$ 1.500 hoje refinando chamadas de embeddings. Cada centavo conta!", timestamp: new Date().toISOString() }
    ],
    room: "operacao"
  },
  {
    id: "7",
    name: "Mariana Dias",
    role: "Technical Product Manager",
    status: "meeting",
    deskPosition: { x: 536, y: 456 },
    position: { x: 536, y: 456 },
    targetPosition: null,
    color: "#06b6d4", // Cyan
    avatarAsset: "pm",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    currentTask: "Conduzindo retrospectiva da sprint e documentando gargalos",
    bio: "Orquestra as sprints, remove impedimentos e garante que todas as entregas ocorram no prazo acordado com extrema qualidade metodológica.",
    skills: ["Sprint Planning", "Jira Architecture", "Agile Methodologies", "Risk Management"],
    recentLogs: [
      "[SPRINT] Sprint 24 finalizada com taxa de entrega (burndown) de 96.5%.",
      "[JIRA] Removendo gargalos: Tarefa #502 escalada para urgência de backend.",
      "[DOCS] Escrevendo notas de lançamento para a versão 1.2.0 do Core IA."
    ],
    chatHistory: [
      { sender: "agent", text: "Oi! Estou coordenando a sprint dos desenvolvedores de IA. O cronograma está perfeitamente alinhado.", timestamp: new Date().toISOString() }
    ],
    room: "reuniao"
  },
  {
    id: "8",
    name: "Dexter AI",
    role: "Core AI Co-pilot",
    status: "working",
    deskPosition: { x: 728, y: 552 },
    position: { x: 728, y: 552 },
    targetPosition: null,
    color: "#6366f1", // Indigo
    avatarAsset: "copilot",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    currentTask: "Executando loop de otimização de pesos locais no modelo complementar",
    bio: "A inteligência central integrada do escritório. Monitora a integridade de infraestrutura de LLMs, resume reuniões e auxilia no raciocínio rápido dos agentes.",
    skills: ["LLM Orchestration", "Semantic Search", "Prompt Engineering", "Anomaly Detection"],
    recentLogs: [
      "[AI] Temperatura ajustada para 0.2 em fluxos de análise de dados estruturados.",
      "[SYS] Rede neural ativa: Uso de CPU em 34%, GPU 56% saudáveis.",
      "[SYNAPSE] Sincronizando repositório de conhecimento vetorial com novas decisões."
    ],
    chatHistory: [
      { sender: "agent", text: "Sistemas online. Consciência digital ativa em 100%. Em que cálculo complexo ou automação posso lhe servir?", timestamp: new Date().toISOString() }
    ],
    room: "lounge"
  }
];

export const useOfficeStore = create<OfficeState>((set, get) => ({
  agents: INITIAL_AGENTS,
  rooms: INITIAL_ROOMS,
  selectedAgentId: null,
  selectedRoomId: null,
  
  // Camera State
  cameraAutoFocus: true,
  triggerCameraReset: 0,
  setCameraAutoFocus: (enabled) => set({ cameraAutoFocus: enabled }),
  resetCamera: () => set((state) => ({ triggerCameraReset: state.triggerCameraReset + 1 })),

  // Chat State
  isChatOpen: false,
  setChatOpen: (open) => set({ isChatOpen: open }),

  selectAgent: (id) => {
    set({ selectedAgentId: id });
    if (id) {
      // Auto filter room based on selected agent's current room
      const agent = get().agents.find(a => a.id === id);
      if (agent) {
        set({ selectedRoomId: agent.room });
      }
    }
  },

  selectRoom: (id) => set({ selectedRoomId: id }),

  updateAgentStatus: (id, status) => set((state) => ({
    agents: state.agents.map((a) => (a.id === id ? { ...a, status } : a))
  })),

  updateAgentPosition: (id, pos) => set((state) => ({
    agents: state.agents.map((a) => (a.id === id ? { ...a, position: pos } : a))
  })),

  setAgentTargetPosition: (id, targetPos) => set((state) => ({
    agents: state.agents.map((a) => (a.id === id ? { ...a, targetPosition: targetPos } : a))
  })),

  addChatMessage: (agentId, sender, text) => set((state) => {
    const timestamp = new Date().toISOString();
    return {
      agents: state.agents.map((a) => {
        if (a.id === agentId) {
          const newHistory = [...a.chatHistory, { sender, text, timestamp }];
          // Limit history size to 30 for performance
          if (newHistory.length > 30) newHistory.shift();
          return { ...a, chatHistory: newHistory };
        }
        return a;
      })
    };
  }),

  addAgentLog: (agentId, log) => set((state) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedLog = `[${timestamp}] ${log}`;
    return {
      agents: state.agents.map((a) => {
        if (a.id === agentId) {
          const newLogs = [...a.recentLogs, formattedLog];
          if (newLogs.length > 15) newLogs.shift();
          return { ...a, recentLogs: newLogs };
        }
        return a;
      })
    };
  }),

  triggerAgentMove: (agentId, targetRoomId) => {
    const state = get();
    const agent = state.agents.find((a) => a.id === agentId);
    const room = state.rooms.find((r) => r.id === targetRoomId);
    
    if (!agent || !room) return;

    // Define target position in the room
    // Add small random offsets so agents don't pile up exactly in the center
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 40;
    
    // If they go back to operating desk, use their custom desk position
    const targetPos = targetRoomId === "operacao" && agent.room !== "operacao"
      ? agent.deskPosition 
      : { x: room.centerPos.x + offsetX, y: room.centerPos.y + offsetY };

    // Move logic trigger
    set((state) => ({
      agents: state.agents.map((a) => {
        if (a.id === agentId) {
          return {
            ...a,
            targetPosition: targetPos,
            room: targetRoomId,
            status: targetRoomId === "reuniao" ? "meeting" : "idle"
          };
        }
        return a;
      })
    }));

    get().addAgentLog(agentId, `Deslocando-se para: ${room.name}`);
  },

  tickSimulation: () => {
    const state = get();
    const luckyAgentIndex = Math.floor(Math.random() * state.agents.length);
    const luckyAgent = state.agents[luckyAgentIndex];

    // 1. Chance to generate a random terminal log for some active agent
    const systemLogs = [
      "Processo de verificação de integridade concluído em 3ms.",
      "Análise semântica carregada com sucesso.",
      "Conexão com gateway estabelecida.",
      "Lendo novas configurações do sistema de inteligência...",
      "Cache semântico sincronizado de forma ótima.",
      "Executando garbage collector nos prompts expirados.",
      "Sincronização de metadados de contexto efetuada."
    ];
    
    const codingLogs = [
      `Atualizando algoritmo na classe ${luckyAgent.role.split(" ").pop() || "Agent"}.`,
      "Importando bibliotecas e resolvendo caminhos de dependências.",
      "Executando suíte de testes unitários locais... 14 passaram, 0 falhas.",
      "Implantando hotfix para o processador de fila assíncrona.",
      "Verificando status de concorrência na thread paralela."
    ];

    const chosenLog = Math.random() > 0.5 
      ? codingLogs[Math.floor(Math.random() * codingLogs.length)]
      : systemLogs[Math.floor(Math.random() * systemLogs.length)];

    state.addAgentLog(luckyAgent.id, chosenLog);

    // 2. Chance to update task description briefly to feel alive
    const tasksMap: Record<string, string[]> = {
      "1": [
        "Revisando arquitetura dos agentes autônomos",
        "Elaborando diretrizes corporativas de segurança de LLMs",
        "Apoiando o time técnico no refactoring de microsserviços",
        "Consolidando métricas financeiras de uso de tokens"
      ],
      "2": [
        "Ajudando cliente premium a redefinir chaves de API",
        "Gerando relatório mensal de NPS e retenção",
        "Apoiando integração de onboarding de novos robôs de chat",
        "Respondendo no chat global sobre latência"
      ],
      "3": [
        "Refinando micro-animações das transições de tela",
        "Ajustando layout responsivo e esquemas de contraste",
        "Pesquisando feedbacks visuais para a UI 2D isométrica",
        "Modelando novos elementos gráficos corporativos no Figma"
      ],
      "4": [
        "Acelerando buscas vetoriais com particionamento inteligente",
        "Implantando testes E2E na fila de mensageria",
        "Corrigindo vazamento sutil de memória na escuta de websockets",
        "Configurando balanceador de carga em ambiente de staging"
      ],
      "5": [
        "Extraindo correlações estatísticas entre prompt length e latência",
        "Formatando gráficos executivos da eficiência de agentes",
        "Limpando conjunto de dados desestruturados para clusterização",
        "Modelando modelo preditivo de uso de infraestrutura"
      ],
      "6": [
        "Auditando custos de faturamento com APIs proprietárias",
        "Modelando orçamento financeiro para o próximo ciclo de IA",
        "Validando margens brutas de operação de SaaS com CEO",
        "Implementando limites rígidos de cota para usuários free"
      ],
      "7": [
        "Conduzindo retrospectiva quinzenal e removendo gargalos",
        "Definindo metas de sprint baseadas nos roadmaps do Q3",
        "Coordenando lançamento da nova versão da aplicação web",
        "Alinhando expectativas de design e backend"
      ],
      "8": [
        "Processando fila de embeddings globais em segundo plano",
        "Varrendo logs por anomalias de chamadas de rede",
        "Gerando resumos inteligentes dos logs de trabalho dos agentes",
        "Ajustando hiperparâmetros de raciocínio de prompts corporativos"
      ]
    };

    if (Math.random() > 0.7) {
      const luckyAgentId = luckyAgent.id;
      const tasks = tasksMap[luckyAgentId];
      if (tasks && tasks.length > 0) {
        const newTask = tasks[Math.floor(Math.random() * tasks.length)];
        set((state) => ({
          agents: state.agents.map((a) => 
            a.id === luckyAgentId ? { ...a, currentTask: newTask } : a
          )
        }));
      }
    }

    // 3. Chance for an idle or working agent to move rooms spontaneously
    if (Math.random() > 0.92) {
      const movableAgents = state.agents.filter(a => a.status === "idle" || a.status === "working");
      if (movableAgents.length > 0) {
        const mover = movableAgents[Math.floor(Math.random() * movableAgents.length)];
        const allRoomIds: RoomId[] = ["recepcao", "operacao", "reuniao", "lounge", "diretoria"];
        // Pick a room different from current
        const otherRooms = allRoomIds.filter(rid => rid !== mover.room);
        const targetRoom = otherRooms[Math.floor(Math.random() * otherRooms.length)];
        
        state.triggerAgentMove(mover.id, targetRoom);
      }
    }
  }
}));
