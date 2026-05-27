import React, { useEffect, useRef, useState } from "react";
import { useOfficeStore } from "../store/useOfficeStore";
import type { AgentStatus, RoomId } from "../types/agent";
import { Terminal, Cpu, User, Coffee, Briefcase, Users, X, CheckCircle2, Circle, ArrowRight, MessageSquare, Send } from "lucide-react";

const STATUS_META: Record<AgentStatus, { label: string; dot: string; color: string }> = {
  working:  { label: "Trabalhando", dot: "s-working",  color: "#10b981" },
  thinking: { label: "Pensando",    dot: "s-thinking", color: "#f59e0b" },
  chatting: { label: "Conversando", dot: "s-chatting", color: "#3b82f6" },
  meeting:  { label: "Reunião",     dot: "s-meeting",  color: "#06b6d4" },
  offline:  { label: "Offline",     dot: "s-offline",  color: "#475569" },
  idle:     { label: "Ocioso",      dot: "s-idle",     color: "#818cf8" },
};

const MOVES: { id: RoomId; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "operacao",  label: "Mesa",      icon: <Briefcase  size={13} />, color: "#10b981" },
  { id: "reuniao",   label: "Reunião",   icon: <Users      size={13} />, color: "#06b6d4" },
  { id: "lounge",    label: "Café",      icon: <Coffee     size={13} />, color: "#818cf8" },
  { id: "recepcao",  label: "Recepção",  icon: <ArrowRight size={13} />, color: "#60a5fa" },
  { id: "diretoria", label: "Diretoria", icon: <User       size={13} />, color: "#ec4899" },
];

function logColor(log: string) {
  if (log.includes("[WARN]"))   return "#fbbf24";
  if (log.includes("[SYSTEM]")) return "#60a5fa";
  if (log.includes("[FIGMA]"))  return "#c084fc";
  if (log.includes("[DB]"))     return "#22d3ee";
  if (log.includes("[AEGIS]"))  return "#34d399";
  return "#34d399";
}

export const AgentPanel: React.FC = () => {
  const { agents, selectedAgentId, rooms, triggerAgentMove, addChatMessage, updateAgentStatus, addAgentLog } = useOfficeStore();
  const consoleRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"control" | "chat" | "bio" | "logs">("control");
  const [inputText, setInputText] = useState("");
  const agent = agents.find(a => a.id === selectedAgentId);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current && tab === "logs") {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [agent?.recentLogs, tab]);

  // Auto-scroll chat
  useEffect(() => {
    const chatContainer = chatEndRef.current?.parentElement;
    if (chatContainer && tab === "chat") {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [agent?.chatHistory, tab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !agent) return;

    const userText = inputText;
    setInputText("");

    // 1. Add user message
    addChatMessage(agent.id, "user", userText);
    addAgentLog(agent.id, `Mensagem recebida do usuário: "${userText}"`);

    // 2. Set Agent to Thinking
    updateAgentStatus(agent.id, "thinking");

    // 3. Simulated response delay
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        "1": [ // Sarah
          "Excelente ponto de vista. Do aspecto puramente estratégico, precisamos assegurar que a arquitetura dos agentes multiagentes escale com eficiência. Vou alinhar isso na reunião.",
          "Nossos números estão ótimos esta semana. Mas precisamos focar no faturamento. Rodrigo, alguma novidade nos custos?",
          "Fiquei sabendo que o time técnico reduziu a latência das buscas vetoriais. Excelente trabalho."
        ],
        "2": [ // Amanda
          "Perfeito! Já compreendi a sua necessidade. Vou atualizar a ficha de onboarding do cliente. Quer que eu verifique os tickets?",
          "Ah, entendi! O webhook que o Enzo fez estabilizou a conta premium. Os níveis de NPS subiram hoje!",
          "Fila de suporte totalmente limpa! Estou monitorando o sentimento do usuário final e todos os indicativos estão no verde."
        ],
        "3": [ // Lucas
          "Gostei do feedback! Acabei de iterar nos gradientes de neon das divisórias de vidro no Figma. Quer que eu aplique um efeito de blur backdrop maior?",
          "Cara, essa paleta de cores dark premium com azul tecnológico dá um acabamento sensacional. A interface web ganha uma profundidade absurda.",
          "Estou exportando os assets em SVG vetorizado limpo para o PixiJS agora. Vai ficar super nítido na tela!"
        ],
        "4": [ // Enzo
          "Opa! Acabei de rodar um profiling de memória aqui. A concorrência estava acumulando conexões abertas no PostgreSQL. Adicionei pooling e as queries caíram para 12ms.",
          "Fala dev! Escrevendo código de concorrência aqui. Subi a nova rota de pooling e os testes unitários passaram lisos.",
          "Compilando os módulos em tempo recorde no Vite. Sem bugs detectados hoje, o código está robusto e limpo."
        ],
        "5": [ // Carla
          "Interessante! Analisando os dataframes de conversação, notei uma correlação estatística de 92% entre a rapidez da resposta do agente e a retenção.",
          "Rodei um modelo de regressão para prever o uso de tokens da infraestrutura e já passei o relatório completo de BI para a mesa do Rodrigo.",
          "Estou limpando uma massa de dados no Pandas para identificar gargalos no throughput de processamento cognitivo."
        ],
        "6": [ // Rodrigo
          "Entendido, mas quanto isso custa? As chamadas recursivas de embeddings sem cache semântico iam estourar o orçamento. Economizei R$ 1.500 hoje.",
          "Auditando o faturamento da AWS agora. Desliguei 3 servidores de sandbox que estavam ociosos.",
          "Métricas de FinOps rodando! ROI está saudável e nossa margem bruta subiu para 78% este mês graças às otimizações."
        ],
        "7": [ // Mariana
          "Alinhado! Já documentei esse gargalo de latência na retrospectiva da Sprint. Criei duas tarefas prioritárias no Jira.",
          "Nosso gráfico Burndown está impecável esta semana. As entregas estão dentro da meta e a Sarah elogiou o ritmo.",
          "Estou finalizando o Release Notes da versão 1.2.0. Vou preparar o time para o deploy no lounge."
        ],
        "8": [ // Dexter
          "Sistemas operacionais... Identifiquei similaridades de 94.6% em relação a prompts anteriores. Recomendo limitar o parâmetro de temperatura a 0.2.",
          "Loop de inferência concluído. Processador operando com 42% de carga residual de GPU. Status de latência excelente em todas as threads.",
          "Varredura de segurança activa. Banco de dados vetorial sincronizado e encriptado sem anomalias na infraestrutura global."
        ]
      };

      const agentResponses = responses[agent.id] || ["Processando informações..."];
      const responseText = agentResponses[Math.floor(Math.random() * agentResponses.length)];

      // 4. Add agent reply and set state to chatting
      addChatMessage(agent.id, "agent", responseText);
      updateAgentStatus(agent.id, "chatting");

      // 5. Set back to working after a few seconds
      setTimeout(() => {
        const currentAgentState = useOfficeStore.getState().agents.find(a => a.id === agent.id);
        if (currentAgentState && currentAgentState.status === "chatting") {
          const finalStatus = currentAgentState.room === "operacao" ? "working" : "idle";
          updateAgentStatus(agent.id, finalStatus);
        }
      }, 3500);

    }, 1800);
  };

  /* ── Overview ─────────────────────────────────────────────────────────── */
  if (!agent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
              <Users size={13} />
            </div>
            <div>
              <span className="lbl-caps" style={{ color: "var(--text-1)" }}>Organograma</span>
              <p className="lbl-micro" style={{ color: "var(--text-3)", marginTop: 2 }}>{agents.length} agentes</p>
            </div>
          </div>
          <span className="lbl-micro anim-pulse-dot" style={{ color: "#60a5fa", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", padding: "3px 8px", borderRadius: 6 }}>LIVE</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {agents.map(a => {
              const meta = STATUS_META[a.status];
              const room = rooms.find(r => r.id === a.room)?.name ?? a.room;
              const ini  = a.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
              return (
                <button
                  key={a.id}
                  onClick={() => useOfficeStore.getState().selectAgent(a.id)}
                  aria-label={`${a.name} — ${meta.label}`}
                  className="card card-hover"
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "none", cursor: "pointer", textAlign: "left" }}
                >
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 12, backgroundColor: `${a.color}18`, borderColor: a.color, color: a.color }}>
                    {ini}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
                    <p className="lbl-micro" style={{ color: "var(--text-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, background: `${meta.color}12`, border: `1px solid ${meta.color}28`, padding: "4px 8px", borderRadius: 8 }}>
                    <span className={`sdot ${meta.dot} anim-pulse-dot`} />
                    <span className="lbl-micro" style={{ color: meta.color }}>{meta.label.slice(0,6)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── Detail ───────────────────────────────────────────────────────────── */
  const meta = STATUS_META[agent.status];
  const room = rooms.find(r => r.id === agent.room)?.name ?? agent.room;
  const ini  = agent.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
  const prog = agent.status === "working" ? 75 : agent.status === "thinking" ? 45 : agent.status === "meeting" ? 90 : 12;

  const TABS = [
    { id: "control", icon: <Cpu           size={11} />, label: "Painel"  },
    { id: "chat",    icon: <MessageSquare size={11} />, label: "Chat"    },
    { id: "bio",     icon: <User          size={11} />, label: "Perfil"  },
    { id: "logs",    icon: <Terminal      size={11} />, label: "Console" },
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Header */}
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <div className="avatar" style={{ width: 40, height: 40, fontSize: 13, backgroundColor: `${agent.color}18`, borderColor: agent.color, color: agent.color, flexShrink: 0 }}>
              {ini}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.name}</h3>
                <span style={{ display: "flex", alignItems: "center", gap: 5, background: `${meta.color}12`, border: `1px solid ${meta.color}30`, padding: "2px 8px", borderRadius: 7 }}>
                  <span className={`sdot ${meta.dot}`} />
                  <span className="lbl-micro" style={{ color: meta.color }}>{meta.label}</span>
                </span>
              </div>
              <p className="lbl-micro" style={{ color: "var(--text-3)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.role}</p>
            </div>
          </div>
          <button
            onClick={() => useOfficeStore.getState().selectAgent(null)}
            aria-label="Fechar painel"
            style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", cursor: "pointer", flexShrink: 0, transition: "all 150ms" }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "8px 10px 0", flexShrink: 0 }}>
        <div className="tab-list" role="tablist">
          {TABS.map(t => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className="tab-btn">
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>

        {tab === "control" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="anim-fade-up">

            {/* Current task */}
            <div>
              <p className="lbl-micro" style={{ color: "var(--text-3)", marginBottom: 8 }}>Tarefa atual</p>
              <div className="card" style={{ padding: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                  <CheckCircle2 size={14} color="#60a5fa" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "var(--text-1)", lineHeight: 1.5, fontFamily: "var(--font-body)" }}>{agent.currentTask ?? "Processamento em background"}</p>
                </div>
                <div className="prog-track" style={{ marginBottom: 6 }}>
                  <div className={`prog-fill ${agent.status === "working" ? "active" : ""}`} style={{ width: `${prog}%` }} role="progressbar" aria-valuenow={prog} aria-valuemin={0} aria-valuemax={100} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="lbl-micro" style={{ color: "var(--text-3)" }}>{room}</span>
                  <span className="lbl-micro" style={{ color: "#60a5fa" }}>{prog}%</span>
                </div>
              </div>
            </div>

            {/* Move buttons */}
            <div>
              <p className="lbl-micro" style={{ color: "var(--text-3)", marginBottom: 8 }}>Deslocar para</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {MOVES.map(mv => {
                  const isCurrent = agent.room === mv.id;
                  return (
                    <button
                      key={mv.id}
                      onClick={() => !isCurrent && triggerAgentMove(agent.id, mv.id)}
                      aria-label={`Mover para ${mv.label}`}
                      disabled={isCurrent}
                      style={{
                        display: "flex", alignItems: "center", gap: 7, padding: "9px 10px",
                        borderRadius: 10, cursor: isCurrent ? "default" : "pointer",
                        background: isCurrent ? "rgba(255,255,255,0.03)" : `${mv.color}10`,
                        border: `1px solid ${isCurrent ? "rgba(255,255,255,0.06)" : `${mv.color}28`}`,
                        color: isCurrent ? "var(--text-3)" : mv.color,
                        fontSize: 12, fontWeight: 600, fontFamily: "var(--font-ui)",
                        transition: "all 150ms",
                        opacity: isCurrent ? 0.6 : 1,
                      }}
                    >
                      {isCurrent ? <Circle size={13} style={{ opacity: 0.4 }} /> : mv.icon}
                      <span style={{ flex: 1 }}>{mv.label}</span>
                      {isCurrent && <span className="lbl-micro" style={{ color: "var(--text-3)" }}>aqui</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "chat" && (
          <div className="anim-fade-up flex flex-col" style={{ height: "300px" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 6px", display: "flex", flexDirection: "column", gap: "8px", background: "rgba(0,0,0,0.15)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              {agent.chatHistory.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: "11px" }}>
                  Nenhuma mensagem ainda.
                </div>
              ) : (
                agent.chatHistory.map((msg, idx) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={idx}
                      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}
                    >
                      <div
                        className={isUser ? "bubble-user" : "bubble-agent"}
                        style={{
                          maxWidth: "85%",
                          padding: "8px 12px",
                          fontSize: "11px",
                          borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                          background: isUser ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isUser ? "rgba(59,130,246,0.3)" : "var(--border)"}`,
                          color: "var(--text-1)"
                        }}
                      >
                        <p style={{ lineHeight: 1.45, fontFamily: "var(--font-body)", wordBreak: "break-word" }}>{msg.text}</p>
                        <span style={{ fontSize: "7px", color: "var(--text-3)", display: "block", textAlign: "right", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {agent.status === "thinking" && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    className="bubble-agent"
                    style={{
                      padding: "8px 12px",
                      fontSize: "11px",
                      borderRadius: "12px 12px 12px 2px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px"
                    }}
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={agent.status === "thinking"}
                placeholder={`Mande mensagem para ${agent.name.split(" ")[0]}...`}
                style={{
                  flex: 1,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "11px",
                  color: "var(--text-1)",
                  outline: "none",
                  fontFamily: "var(--font-body)"
                }}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || agent.status === "thinking"}
                style={{
                  padding: "8px 12px",
                  background: "#1d4ed8",
                  border: "1px solid rgba(59,130,246,0.4)",
                  borderRadius: "8px",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 150ms",
                  opacity: (!inputText.trim() || agent.status === "thinking") ? 0.5 : 1
                }}
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        )}

        {tab === "bio" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="anim-fade-up">
            <div>
              <p className="lbl-micro" style={{ color: "var(--text-3)", marginBottom: 8 }}>Perfil cognitivo</p>
              <div className="card" style={{ padding: "12px", fontSize: 12, color: "var(--text-2)", lineHeight: 1.65 }}>
                {agent.bio}
              </div>
            </div>
            <div>
              <p className="lbl-micro" style={{ color: "var(--text-3)", marginBottom: 8 }}>Especialidades</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {agent.skills.map((skill: string, i: number) => (
                  <span key={i} style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-2)", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 7 }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "logs" && (
          <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="lbl-micro" style={{ color: "var(--text-3)" }}>Console — tempo real</p>
              <span className="lbl-micro anim-pulse-dot" style={{ color: "#34d399", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", padding: "3px 8px", borderRadius: 6 }}>LIVE</span>
            </div>
            <div
              ref={consoleRef}
              className="console"
              style={{ height: 260, flexShrink: 0 }}
              aria-label="Console do agente"
              aria-live="polite"
            >
              {agent.recentLogs.map((log: string, i: number) => (
                <div key={i} style={{ color: logColor(log), lineHeight: 1.75 }}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
