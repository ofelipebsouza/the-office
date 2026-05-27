import React, { useState, useRef, useEffect } from "react";
import { useOfficeStore } from "../store/useOfficeStore";
import { 
  Send, X, Maximize2, Minimize2, 
  Menu, Compass, History, Hash 
} from "lucide-react";

interface ChatPanelProps {
  rightSidebarOpen?: boolean; // Maintained for consistency, although positioning is now centered
}

interface GlobalMessage {
  sender: "user" | "agent";
  agentId?: string;
  agentName?: string;
  text: string;
  timestamp: string;
}

const MOCK_HISTORY = [
  { id: "h1", title: "Refatoração de API PostgreSQL", channelId: "enzo" },
  { id: "h2", title: "Planejamento Q3 Multiagentes", channelId: "geral" },
  { id: "h3", title: "Auditoria FinOps & Custos AWS", channelId: "rodrigo" }
];

export const ChatPanel: React.FC<ChatPanelProps> = () => {
  const { agents, selectedAgentId, selectAgent, addChatMessage, updateAgentStatus, addAgentLog, isChatOpen, setChatOpen } = useOfficeStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeChannel, setActiveChannel] = useState<string>("geral"); // "geral" or agentId
  


  const [globalHistory, setGlobalHistory] = useState<GlobalMessage[]>([
    {
      sender: "agent",
      agentId: "8",
      agentName: "Dexter AI",
      text: "Olá! Bem-vindo ao canal geral do escritório virtual. Toda a equipe está ativa e monitorando este canal. Como podemos te auxiliar no trabalho hoje?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Auto-synchronize store selected agent with active chat channel
  useEffect(() => {
    if (selectedAgentId && selectedAgentId !== activeChannel) {
      setActiveChannel(selectedAgentId);
    }
  }, [selectedAgentId]);

  // Handle active channel change to update global selected agent in store
  const handleSelectChannel = (channelId: string) => {
    setActiveChannel(channelId);
    setMobileSidebarOpen(false);
    if (channelId === "geral") {
      selectAgent(null);
    } else {
      selectAgent(channelId);
    }
  };

  // Auto scroll
  useEffect(() => {
    const chatContainer = chatEndRef.current?.parentElement;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [globalHistory, selectedAgent?.chatHistory, isChatOpen, activeChannel]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText("");

    if (activeChannel === "geral") {
      // 1. Add user message to global history
      const userMsg: GlobalMessage = {
        sender: "user",
        text: userText,
        timestamp: new Date().toISOString()
      };
      setGlobalHistory(prev => [...prev, userMsg]);

      // 2. Select a random agent to respond
      const respondents = agents.filter(a => a.id !== "8"); // exclude copilot by default for randomness
      const primaryAgent = respondents[Math.floor(Math.random() * respondents.length)];
      
      updateAgentStatus(primaryAgent.id, "thinking");
      addAgentLog(primaryAgent.id, `[GERAL] Nova menção: "${userText}"`);

      setTimeout(() => {
        const responses: Record<string, string[]> = {
          "1": [ // Sarah
            "Do aspecto de estratégia, concordo. Precisamos alinhar nossas prioridades de arquitetura para mitigar a latência do gateway.",
            "Excelente reflexão. Vou cruzar isso no roadmap estratégico e validar com o time no lounge."
          ],
          "2": [ // Amanda
            "Interessante! Nossos clientes premium mencionaram exatamente esse gargalo hoje. Precisamos dar atenção a isso na fila do suporte.",
            "Vou registrar essa sugestão na nossa base de conhecimento para otimizar os fluxos de onboarding."
          ],
          "3": [ // Lucas
            "Visualmente falando, isso pede uma interface extremamente refinada. Vou rabiscar um fluxo neon dark premium no Figma pra gente analisar.",
            "Sensacional! Isso vai ficar muito foda integrado com os efeitos holográficos e as micro-animações do PixiJS."
          ],
          "4": [ // Enzo
            "Opa! Já monitorando isso por aqui. Tem cara de gargalo de conexões no PostgreSQL. Se aplicarmos cache semântico, a latência cai para 10ms.",
            "Código limpo na veia. Já preparei a rota de pooling e os testes unitários passaram lisos. Só mandar o deploy."
          ],
          "5": [ // Carla
            "Analisando os dataframes com Pandas, notei uma correlação estatística de 88% entre essa mudança e a melhora na vazão cognitiva.",
            "Rodei a regressão e as métricas de performance suportam essa tese. Vou estruturar em um gráfico de BI."
          ],
          "6": [ // Rodrigo
            "Isso tem um ROI excelente! Se otimizarmos os custos de embeddings e infraestrutura com cache, economizamos uns R$ 2.000 mensais.",
            "Alinhado, contanto que caiba na margem bruta de 78%. Faturamento sob controle por aqui."
          ],
          "7": [ // Mariana
            "Já documentei isso na retrospectiva da sprint e criei as respectivas tarefas no Jira. Enzo, consegue focar nisso hoje?",
            "Perfeito. Vou organizar com o time para garantir que essa entrega ocorra na nossa sprint de lançamento."
          ]
        };

        const agentList = responses[primaryAgent.id] || ["Processando novos prompts técnicos..."];
        const primaryReply = agentList[Math.floor(Math.random() * agentList.length)];

        setGlobalHistory(prev => [...prev, {
          sender: "agent",
          agentId: primaryAgent.id,
          agentName: primaryAgent.name,
          text: primaryReply,
          timestamp: new Date().toISOString()
        }]);

        updateAgentStatus(primaryAgent.id, "chatting");
        addAgentLog(primaryAgent.id, `[GERAL] Resposta enviada no canal global.`);

        setTimeout(() => {
          const currentStatus = useOfficeStore.getState().agents.find(a => a.id === primaryAgent.id)?.room;
          updateAgentStatus(primaryAgent.id, currentStatus === "operacao" ? "working" : "idle");
        }, 3000);

        // 40% chance of a secondary agent chiming in sequentially! (Dynamic co-working feeling)
        if (Math.random() > 0.6) {
          setTimeout(() => {
            const secondaryAgent = respondents.find(a => a.id !== primaryAgent.id) || agents[7]; // fallback to Copilot
            updateAgentStatus(secondaryAgent.id, "thinking");

            setTimeout(() => {
              const secondaryReplies = [
                `Concordo com o ponto da ${primaryAgent.name.split(" ")[0]}! Já estou integrando isso nas minhas tarefas.`,
                `Faz total sentido. ${primaryAgent.name.split(" ")[0]}, quer alinhar isso na sala de reunião daqui a pouco?`,
                `Muito bom. Já estou puxando esses metadados para consolidar com o que estou trabalhando.`
              ];
              const secondaryReply = secondaryReplies[Math.floor(Math.random() * secondaryReplies.length)];

              setGlobalHistory(prev => [...prev, {
                sender: "agent",
                agentId: secondaryAgent.id,
                agentName: secondaryAgent.name,
                text: secondaryReply,
                timestamp: new Date().toISOString()
              }]);

              updateAgentStatus(secondaryAgent.id, "chatting");
              addAgentLog(secondaryAgent.id, `[GERAL] Interagiu com ${primaryAgent.name.split(" ")[0]} no chat global.`);

              setTimeout(() => {
                const secStatus = useOfficeStore.getState().agents.find(a => a.id === secondaryAgent.id)?.room;
                updateAgentStatus(secondaryAgent.id, secStatus === "operacao" ? "working" : "idle");
              }, 3000);

            }, 1500);
          }, 2200);
        }

      }, 1600);

    } else {
      // Direct messaging channel to a specific agent
      const agentId = activeChannel;
      const userText = inputText;

      addChatMessage(agentId, "user", userText);
      addAgentLog(agentId, `Mensagem recebida do usuário: "${userText}"`);
      updateAgentStatus(agentId, "thinking");

      setTimeout(() => {
        const responses: Record<string, string[]> = {
          "1": [
            "Excelente ponto de vista. Do aspecto puramente estratégico, precisamos assegurar que a arquitetura dos agentes multiagentes escale com eficiência. Vou alinhar isso na reunião.",
            "Nossos números estão ótimos esta semana. Mas precisamos focar no faturamento. Rodrigo, alguma novidade nos custos?",
            "Fiquei sabendo que o time técnico reduziu a latência das buscas vetoriais. Excelente trabalho."
          ],
          "2": [
            "Perfeito! Já compreendi a sua necessidade. Vou atualizar a ficha de onboarding do cliente. Quer que eu verifique os tickets?",
            "Ah, entendi! O webhook que o Enzo fez estabilizou a conta premium. Os níveis de NPS subiram hoje!",
            "Fila de suporte totalmente limpa! Estou monitorando o sentimento do usuário final e todos os indicativos estão no verde."
          ],
          "3": [
            "Gostei do feedback! Acabei de iterar nos gradientes de neon das divisórias de vidro no Figma. Quer que eu aplique um efeito de blur backdrop maior?",
            "Cara, essa paleta de cores dark premium com azul tecnológico dá um acabamento sensacional. A interface web ganha uma profundidade absurda.",
            "Estou exportando os assets em SVG vetorizado limpo para o PixiJS agora. Vai ficar super nítido na tela!"
          ],
          "4": [
            "Opa! Acabei de rodar um profiling de memória aqui. A concorrência estava acumulando conexões abertas no PostgreSQL. Adicionei pooling e as queries caíram para 12ms.",
            "Fala dev! Escrevendo código de concorrência aqui. Subi a nova rota de pooling e os testes unitários passaram lisos.",
            "Compilando os módulos em tempo recorde no Vite. Sem bugs detectados hoje, o código está robusto e limpo."
          ],
          "5": [
            "Interessante! Analisando os dataframes de conversação, notei uma correlação estatística de 92% entre a rapidez da resposta do agente e a retenção.",
            "Rodei um modelo de regressão para prever o uso de tokens da infraestrutura e já passei o relatório completo de BI para a mesa do Rodrigo.",
            "Estou limpando uma massa de dados no Pandas para identificar gargalos no throughput de processamento cognitivo."
          ],
          "6": [
            "Entendido, mas quanto isso custa? As chamadas recursivas de embeddings sem cache semântico iam estourar o orçamento. Economizei R$ 1.500 hoje.",
            "Auditando o faturamento da AWS agora. Desliguei 3 servidores de sandbox que estavam ociosos.",
            "Métricas de FinOps rodando! ROI está saudável e nossa margem bruta subiu para 78% este mês graças às otimizações."
          ],
          "7": [
            "Alinhado! Já documentei esse gargalo de latência na retrospectiva da Sprint. Criei duas tarefas prioritárias no Jira.",
            "Nosso gráfico Burndown está impecável esta semana. As entregas estão dentro da meta e a Sarah elogiou o ritmo.",
            "Estou finalizando o Release Notes da versão 1.2.0. Vou preparar o time para o deploy no lounge."
          ],
          "8": [
            "Sistemas operacionais... Identifiquei similaridades de 94.6% em relação a prompts anteriores. Recomendo limitar o parâmetro de temperatura a 0.2.",
            "Loop de inferência concluído. Processador operando com 42% de carga residual de GPU. Status de latência excelente em todas as threads.",
            "Varredura de segurança ativa. Banco de dados vetorial sincronizado e encriptado sem anomalias na infraestrutura global."
          ]
        };

        const agentReplies = responses[agentId] || ["Processando informações..."];
        const responseText = agentReplies[Math.floor(Math.random() * agentReplies.length)];

        addChatMessage(agentId, "agent", responseText);
        updateAgentStatus(agentId, "chatting");

        setTimeout(() => {
          const currentRoom = useOfficeStore.getState().agents.find(a => a.id === agentId)?.room;
          updateAgentStatus(agentId, currentRoom === "operacao" ? "working" : "idle");
        }, 3500);

      }, 1800);
    }
  };

  const activeChannelName = activeChannel === "geral" 
    ? "geral" 
    : agents.find(a => a.id === activeChannel)?.name.split(" ")[0].toLowerCase() || "agente";

  const activeChannelDesc = activeChannel === "geral"
    ? "Canal de comunicação integrado de toda a corporação (multiagentes)"
    : agents.find(a => a.id === activeChannel)?.role || "Conversação direta e confidencial";

  return (
    <>
      {/* Expanded Chat Modal - Centered Windows-style popup */}
      {isChatOpen && (
        <div className={`chat-panel-modal ${isMaximized ? "maximized" : ""}`}>
          {/* Main Container Grid */}
          <div style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            position: "relative",
            width: "100%",
            height: "100%"
          }}>
            
            {/* Mobile Sidebar Backdrop */}
            {mobileSidebarOpen && (
              <div 
                className="mobile-only-block"
                onClick={() => setMobileSidebarOpen(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(2px)",
                  zIndex: 90,
                }}
              />
            )}

            {/* Sidebar Column: Channels & History */}
            <div
              className={`chat-sidebar-mobile ${mobileSidebarOpen ? "open" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                borderRight: (isMaximized || mobileSidebarOpen) ? "1px solid rgba(255, 255, 255, 0.06)" : "none",
                width: (isMaximized || mobileSidebarOpen) ? "220px" : "0px",
                opacity: (isMaximized || mobileSidebarOpen) ? 1 : 0,
                overflow: "hidden",
                background: "rgba(0, 0, 0, 0.25)",
                zIndex: 100,
              }}
            >
              {/* Sidebar Header */}
              <div style={{
                padding: "14px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0
              }}>
                <span style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "var(--text-3)",
                  letterSpacing: "1px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <Compass size={12} style={{ color: "#3b82f6" }} />
                  WORKSPACE IA
                </span>
                {mobileSidebarOpen && (
                  <button 
                    onClick={() => setMobileSidebarOpen(false)} 
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-3)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Channels Section */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}>
                <div>
                  <span style={{
                    display: "block",
                    padding: "0 8px",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "var(--text-3)",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-ui)",
                    marginBottom: "6px"
                  }}>CANAIS GLOBAIS</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    <button
                      onClick={() => handleSelectChannel("geral")}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        textAlign: "left",
                        border: "none",
                        cursor: "pointer",
                        background: activeChannel === "geral" 
                          ? "rgba(59, 130, 246, 0.12)" 
                          : "transparent",
                        color: activeChannel === "geral" 
                          ? "#60a5fa" 
                          : "var(--text-2)",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        if (activeChannel !== "geral") {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                          e.currentTarget.style.color = "var(--text-1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeChannel !== "geral") {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--text-2)";
                        }
                      }}
                    >
                      <Hash size={13} style={{ color: activeChannel === "geral" ? "#3b82f6" : "var(--text-3)" }} />
                      <span>geral</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{
                    display: "block",
                    padding: "0 8px",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "var(--text-3)",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-ui)",
                    marginBottom: "6px"
                  }}>CANAIS DE AGENTES</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {agents.map((a) => {
                      const isChannelActive = activeChannel === a.id;
                      const statusDotStyle: Record<string, string> = {
                        working: "#10b981",
                        thinking: "#f59e0b",
                        chatting: "#3b82f6",
                        meeting: "#06b6d4",
                        offline: "#475569",
                        idle: "#818cf8",
                      };
                      const dotColor = statusDotStyle[a.status] || "#475569";

                      return (
                        <button
                          key={a.id}
                          onClick={() => handleSelectChannel(a.id)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                            textAlign: "left",
                            border: "none",
                            cursor: "pointer",
                            background: isChannelActive 
                              ? "rgba(255, 255, 255, 0.08)" 
                              : "transparent",
                            color: isChannelActive 
                              ? "var(--text-1)" 
                              : "var(--text-2)",
                            transition: "all 0.15s ease"
                          }}
                          onMouseEnter={(e) => {
                            if (!isChannelActive) {
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                              e.currentTarget.style.color = "var(--text-1)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isChannelActive) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "var(--text-2)";
                            }
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: dotColor,
                              boxShadow: `0 0 4px ${dotColor}`,
                              flexShrink: 0
                            }}
                          />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {a.name.split(" ")[0].toLowerCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chat History Section */}
                <div>
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "0 8px",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "var(--text-3)",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-ui)",
                    marginBottom: "6px"
                  }}>
                    <History size={10} /> RECENTES
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {MOCK_HISTORY.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => handleSelectChannel(h.channelId)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          color: "var(--text-3)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                          e.currentTarget.style.color = "var(--text-2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--text-3)";
                        }}
                        title={h.title}
                      >
                        {h.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Chat Content Area */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
              background: "transparent"
            }}>
              
              {/* Chat Header */}
              <div 
                style={{
                  height: "52px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                  userSelect: "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  {/* Sidebar trigger - visible when sidebar is collapsed (i.e. not maximized or mobile) */}
                  {(!isMaximized || mobileSidebarOpen) && (
                    <button
                      onClick={() => setMobileSidebarOpen(prev => !prev)}
                      style={{
                        padding: "6px",
                        borderRadius: "8px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "none",
                        color: "var(--text-2)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "4px"
                      }}
                    >
                      <Menu size={15} />
                    </button>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-3)", fontWeight: 600 }}>#</span>
                    <h3 style={{
                      fontFamily: "var(--font-ui)",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "var(--text-1)",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>{activeChannelName}</h3>
                  </div>
                  <span style={{
                    fontSize: "10px",
                    color: "var(--text-3)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginLeft: "8px",
                    borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingLeft: "8px"
                  }} className="hidden-mobile">
                    {activeChannelDesc}
                  </span>
                </div>

                {/* Header Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                  {/* Maximize Toggle */}
                  <button
                    onClick={() => setIsMaximized(prev => !prev)}
                    style={{
                      padding: "6px",
                      borderRadius: "8px",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-3)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.color = "var(--text-1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-3)";
                    }}
                    title={isMaximized ? "Restaurar" : "Maximizar"}
                    className="hidden-mobile"
                  >
                    {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>

                  {/* Close Modal */}
                  <button
                    onClick={() => setChatOpen(false)}
                    style={{
                      padding: "6px",
                      borderRadius: "8px",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-3)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.color = "var(--text-1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-3)";
                    }}
                    title="Minimizar chat"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Message List Area */}
              <div 
                className="chat-content-area-mobile"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                {activeChannel === "geral" ? (
                  // Global integrated channel view
                  globalHistory.map((msg, idx) => {
                    const isUser = msg.sender === "user";
                    const respondent = !isUser ? agents.find(a => a.id === msg.agentId) : undefined;

                    return (
                      <div 
                        key={idx} 
                        style={{
                          display: "flex",
                          gap: "12px",
                          justifyContent: isUser ? "flex-end" : "flex-start",
                          width: "100%"
                        }}
                      >
                        {!isUser && (
                          <div 
                            style={{ 
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              fontFamily: "var(--font-ui)",
                              fontSize: "10px",
                              fontWeight: 900,
                              border: "1px solid",
                              borderColor: respondent ? `${respondent.color}40` : "var(--border)",
                              backgroundColor: respondent ? `${respondent.color}15` : "rgba(255,255,255,0.03)",
                              color: respondent ? respondent.color : "var(--text-1)"
                            }}
                          >
                            {respondent?.avatarUrl ? (
                              <img src={respondent.avatarUrl} alt={msg.agentName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              msg.agentName ? msg.agentName.split(" ").map(n => n[0]).join("").slice(0, 2) : "AI"
                            )}
                          </div>
                        )}

                        <div style={{
                          maxWidth: "75%",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          alignItems: isUser ? "flex-end" : "flex-start"
                        }}>
                          {!isUser && (
                            <span 
                              style={{ 
                                fontSize: "9px",
                                fontWeight: 700,
                                fontFamily: "var(--font-mono)",
                                color: respondent ? respondent.color : "var(--text-2)" 
                              }}
                            >
                              {msg.agentName}
                            </span>
                          )}
                          <div
                            style={{
                              borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                              border: isUser ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--border)",
                              background: isUser ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.02)",
                              padding: "10px 14px",
                              fontSize: "12px",
                              color: "var(--text-2)",
                              lineHeight: "1.5",
                              fontFamily: "var(--font-body)",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)"
                            }}
                          >
                            <p style={{ wordBreak: "break-word", margin: 0 }}>{msg.text}</p>
                          </div>
                          <span style={{
                            fontSize: "7px",
                            color: "var(--text-3)",
                            fontFamily: "var(--font-mono)",
                            marginTop: "2px",
                            display: "block"
                          }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Direct Message view for selected agent
                  selectedAgent && (
                    <>
                      {selectedAgent.chatHistory.map((msg, idx) => {
                        const isUser = msg.sender === "user";
                        return (
                          <div 
                            key={idx} 
                            style={{
                              display: "flex",
                              gap: "12px",
                              justifyContent: isUser ? "flex-end" : "flex-start",
                              width: "100%"
                            }}
                          >
                            {!isUser && (
                              <div 
                                style={{ 
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                  fontFamily: "var(--font-ui)",
                                  fontSize: "10px",
                                  fontWeight: 900,
                                  border: "1px solid",
                                  borderColor: `${selectedAgent.color}40`,
                                  backgroundColor: `${selectedAgent.color}15`,
                                  color: selectedAgent.color
                                }}
                              >
                                {selectedAgent.avatarUrl ? (
                                  <img src={selectedAgent.avatarUrl} alt={selectedAgent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  selectedAgent.name.split(" ").map(n => n[0]).join("").slice(0, 2)
                                )}
                              </div>
                            )}

                            <div style={{
                              maxWidth: "75%",
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                              alignItems: isUser ? "flex-end" : "flex-start"
                            }}>
                              {!isUser && (
                                <span style={{ 
                                  fontSize: "9px", 
                                  fontWeight: 700, 
                                  fontFamily: "var(--font-mono)", 
                                  color: selectedAgent.color 
                                }}>
                                  {selectedAgent.name}
                                </span>
                              )}
                              <div
                                style={{
                                  borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                                  border: isUser ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--border)",
                                  background: isUser ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.02)",
                                  padding: "10px 14px",
                                  fontSize: "12px",
                                  color: "var(--text-2)",
                                  lineHeight: "1.5",
                                  fontFamily: "var(--font-body)",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)"
                                }}
                              >
                                <p style={{ wordBreak: "break-word", margin: 0 }}>{msg.text}</p>
                              </div>
                              <span style={{
                                fontSize: "7px",
                                color: "var(--text-3)",
                                fontFamily: "var(--font-mono)",
                                marginTop: "2px",
                                display: "block"
                              }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Thinking indicators */}
                      {selectedAgent.status === "thinking" && (
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", width: "100%" }}>
                          <div 
                            style={{ 
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              fontFamily: "var(--font-ui)",
                              fontSize: "10px",
                              fontWeight: 900,
                              border: "1px solid",
                              borderColor: `${selectedAgent.color}40`,
                              backgroundColor: `${selectedAgent.color}15`,
                              color: selectedAgent.color
                            }}
                          >
                            {selectedAgent.avatarUrl ? (
                              <img src={selectedAgent.avatarUrl} alt={selectedAgent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              selectedAgent.name.split(" ").map(n => n[0]).join("").slice(0, 2)
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "9px", fontWeight: 700, fontFamily: "var(--font-mono)", color: selectedAgent.color }}>
                              {selectedAgent.name}
                            </span>
                            <div style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid var(--border)",
                              borderRadius: "16px 16px 16px 2px",
                              padding: "10px 14px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              <div className="anim-pulse" style={{ width: "4px", height: "4px", backgroundColor: "#3b82f6", borderRadius: "50%" }} />
                              <div className="anim-pulse" style={{ width: "4px", height: "4px", backgroundColor: "#3b82f6", borderRadius: "50%", animationDelay: "200ms" }} />
                              <div className="anim-pulse" style={{ width: "4px", height: "4px", backgroundColor: "#3b82f6", borderRadius: "50%", animationDelay: "400ms" }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )
                )}

                {/* Geral respondent thinking */}
                {activeChannel === "geral" && agents.some(a => a.status === "thinking") && (
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", width: "100%" }}>
                    <div style={{ 
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      fontFamily: "var(--font-ui)",
                      fontSize: "10px",
                      fontWeight: 900,
                      border: "1px solid var(--border)",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      color: "var(--text-3)"
                    }}>
                      {agents.find(a => a.status === "thinking")?.avatarUrl ? (
                        <img src={agents.find(a => a.status === "thinking")?.avatarUrl} alt="thinking" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        "IA"
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "9px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>
                        {agents.find(a => a.status === "thinking")?.name || "IA"}
                      </span>
                      <div style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border)",
                        borderRadius: "16px 16px 16px 2px",
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <div className="anim-pulse" style={{ width: "4px", height: "4px", backgroundColor: "#3b82f6", borderRadius: "50%" }} />
                        <div className="anim-pulse" style={{ width: "4px", height: "4px", backgroundColor: "#3b82f6", borderRadius: "50%", animationDelay: "200ms" }} />
                        <div className="anim-pulse" style={{ width: "4px", height: "4px", backgroundColor: "#3b82f6", borderRadius: "50%", animationDelay: "400ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Centered - Grok & ChatGPT aesthetics */}
              <form 
                onSubmit={handleSend} 
                className="chat-input-form-mobile"
                style={{
                  padding: "16px 20px 12px 20px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  background: "rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  borderBottomLeftRadius: "var(--r-xl)",
                  borderBottomRightRadius: "var(--r-xl)",
                  flexShrink: 0,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)"
                }}
              >
                <div style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "var(--r-md)",
                  padding: "8px 12px",
                  transition: "all 0.2s ease"
                }}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={activeChannel !== "geral" ? (selectedAgent?.status === "thinking") : agents.some(a => a.status === "thinking")}
                    placeholder={
                      activeChannel === "geral" 
                        ? "Escreva uma mensagem para a equipe ou menção rápida..." 
                        : `Mande mensagem direta para ${activeChannelName}...`
                    }
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      fontSize: "12px",
                      color: "var(--text-1)",
                      outline: "none",
                      fontFamily: "var(--font-body)"
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || (activeChannel !== "geral" ? (selectedAgent?.status === "thinking") : agents.some(a => a.status === "thinking"))}
                    style={{
                      padding: "8px",
                      backgroundColor: inputText.trim() ? "#2563eb" : "rgba(255, 255, 255, 0.04)",
                      border: "none",
                      borderRadius: "10px",
                      color: inputText.trim() ? "#ffffff" : "var(--text-3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: inputText.trim() ? "pointer" : "not-allowed",
                      transition: "all 0.15s ease",
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      if (inputText.trim()) {
                        e.currentTarget.style.backgroundColor = "#1d4ed8";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (inputText.trim()) {
                        e.currentTarget.style.backgroundColor = "#2563eb";
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                  >
                    <Send size={12} />
                  </button>
                </div>
                <p style={{
                  fontSize: "9px",
                  color: "var(--text-3)",
                  textAlign: "center",
                  margin: 0,
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.3px"
                }}>
                  O chat geral integra o cérebro cognitivo de toda a equipe em tempo de execução.
                </p>
              </form>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
