import { useEffect, useState, useCallback } from "react";
import { useOfficeStore } from "./store/useOfficeStore";
import { OfficeCanvas } from "./components/OfficeCanvas";
import { AgentPanel } from "./components/AgentPanel";
import { ChatPanel } from "./components/ChatPanel";
import { Toolbar } from "./components/Toolbar";
import {
  Sparkles, Activity,
  PanelLeftClose, PanelLeft, PanelRightClose, PanelRight,
  Eye, EyeOff, Video, VideoOff, Shuffle, Award, Play, Shield,
  Coins, BarChart3, Database, Lock, PlusCircle, Users,
  Map, LayoutDashboard, ChevronDown, ChevronUp, MessageCircle,
} from "lucide-react";
import { Crown, Megaphone, Coins as PhCoins, Handshake, Cpu as PhCpu } from "@phosphor-icons/react";
import type { RoomId } from "./types/agent";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface JobItem {
  id: string; title: string; agentName: string; agentId: string;
  status: "pending" | "running" | "completed"; priority: "Alta" | "Média" | "Baixa"; timestamp: string;
}

const INITIAL_JOBS: JobItem[] = [
  { id: "j1", title: "Indexação de Vetores",        agentName: "Enzo Santos",   agentId: "4", status: "completed", priority: "Alta",  timestamp: "12:15" },
  { id: "j2", title: "Limpeza de Logs de Contexto", agentName: "Dexter AI",     agentId: "8", status: "completed", priority: "Baixa", timestamp: "12:18" },
  { id: "j3", title: "Análise de Sentimento",        agentName: "Amanda Costa",  agentId: "2", status: "completed", priority: "Média", timestamp: "12:20" },
];

const TASKS = [
  { title: "Refatoração de API Rest",    id: "4", room: "operacao"  },
  { title: "Auditoria de Custos AWS",   id: "6", room: "operacao"  },
  { title: "Design de Interface v2",    id: "3", room: "operacao"  },
  { title: "Onboarding de Cliente",     id: "2", room: "recepcao"  },
  { title: "Modelagem de Roadmap Q3",   id: "1", room: "diretoria" },
  { title: "Gargalos de Latência API",  id: "7", room: "reuniao"   },
  { title: "Análise de Logs de LLM",    id: "5", room: "operacao"  },
  { title: "Otimização de Pesos Locais",id: "8", room: "lounge"    },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  working: "Trabalhando", thinking: "Pensando", chatting: "Conversando",
  meeting: "Reunião", offline: "Offline", idle: "Ocioso",
};
const STATUS_DOT: Record<string, string> = {
  working: "s-working", thinking: "s-thinking", chatting: "s-chatting",
  meeting: "s-meeting",  offline: "s-offline",   idle: "s-idle",
};

/* ─── Sidebar inner width constants (used in inline width of wrapper + inner) ─ */
// const _LEFT_W  = 264;
// const _RIGHT_W = 300;
const HEADER_H = 44;
const CAMS_H   = 80;

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const { tickSimulation, agents, selectedAgentId, selectAgent, rooms, isChatOpen, setChatOpen } = useOfficeStore();

  const [leftOpen,  setLeftOpen]  = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [cinema,    setCinema]    = useState(false);
  const [camsOpen,  setCamsOpen]  = useState(false);
  const [hudTab,    setHudTab]    = useState<"ranking" | "jobs" | "aegis">("jobs");
  const [jobs,      setJobs]      = useState<JobItem[]>(INITIAL_JOBS);
  const [busy,      setBusy]      = useState(false);
  const [mobileTab, setMobileTab] = useState<"map" | "team" | "hud">("map");
  const [sheetOpen, setSheetOpen] = useState(false);

  // Resizable sidebars state
  const [leftWidth, setLeftWidth] = useState(220); // Default reduced from 264 to 220
  const [rightWidth, setRightWidth] = useState(260); // Default reduced from 300 to 260
  const [isResizing, setIsResizing] = useState(false);

  const startLeftResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = leftWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + deltaX, 190), 340);
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
  };

  const startRightResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = rightWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth - deltaX, 210), 380);
      setRightWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
  };

  // Auto-open mobile panel when selecting an agent
  useEffect(() => {
    if (selectedAgentId && window.innerWidth < 768) {
      setMobileTab("team");
      setSheetOpen(true);
    }
  }, [selectedAgentId]);
  const [depts,     setDepts]     = useState<Record<string, boolean>>({
    socios: true, trafego: false, financeiro: false, comercial: false, tecnologia: true,
  });

  useEffect(() => {
    const t = setInterval(() => tickSimulation(), 3200);
    return () => clearInterval(t);
  }, [tickSimulation]);

  const dispatchJob = useCallback(() => {
    if (busy) return;
    setBusy(true);
    const tmpl  = TASKS[Math.floor(Math.random() * TASKS.length)];
    const agent = agents.find(a => a.id === tmpl.id);
    if (!agent) { setBusy(false); return; }

    const jobId = `j-${Date.now()}`;
    const newJob: JobItem = {
      id: jobId, title: tmpl.title, agentName: agent.name, agentId: agent.id,
      status: "pending",
      priority: Math.random() > 0.6 ? "Alta" : Math.random() > 0.3 ? "Média" : "Baixa",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setJobs(p => [newJob, ...p].slice(0, 12));

    useOfficeStore.getState().addAgentLog(agent.id, `[AEGIS] Job recebido: "${tmpl.title}"`);
    useOfficeStore.getState().addAgentLog(agent.id, `[AEGIS] Prompt Audit: PASS (Trust 99.4%)`);

    setTimeout(() => {
      setJobs(p => p.map(j => j.id === jobId ? { ...j, status: "running" } : j));
      useOfficeStore.getState().triggerAgentMove(agent.id, tmpl.room as RoomId);
      useOfficeStore.getState().updateAgentStatus(agent.id, "working");
      useOfficeStore.setState(s => ({ agents: s.agents.map(a => a.id === agent.id ? { ...a, currentTask: `Executando: ${tmpl.title}` } : a) }));
      useOfficeStore.getState().addAgentLog(agent.id, `[SYSTEM] Compilando job...`);
    }, 1200);

    setTimeout(() => {
      setJobs(p => p.map(j => j.id === jobId ? { ...j, status: "completed" } : j));
      useOfficeStore.getState().updateAgentStatus(agent.id, "idle");
      useOfficeStore.setState(s => ({ agents: s.agents.map(a => a.id === agent.id ? { ...a, currentTask: "Ocioso" } : a) }));
      useOfficeStore.getState().addAgentLog(agent.id, `[SYSTEM] Job concluído com sucesso.`);
      setBusy(false);
    }, 5500);
  }, [busy, agents]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const activeJobs    = jobs.filter(j => j.status === "running").length;
  const activeAgents  = agents.filter(a => a.status !== "offline").length;

  /* ── Layout helpers ─────────────────────────────────────────────────────── */
  const leftW  = leftOpen  && !cinema ? leftWidth  : 0;
  const rightW = rightOpen && !cinema ? rightWidth : 0;

  const DEPT_ITEMS = [
    { key: "socios",     label: "Sócios",        icon: <Crown size={14} weight="duotone" />, color: "#ec4899", agents: [{ id: "1", name: "Sarah",   role: "CEO" }, { id: "6", name: "Rodrigo", role: "CFO" }] },
    { key: "trafego",    label: "Tráfego Pago",  icon: <Megaphone size={14} weight="duotone" />, color: "#60a5fa", agents: [{ id: "2", name: "Amanda",  role: "CS"  }] },
    { key: "financeiro", label: "Financeiro",     icon: <PhCoins size={14} weight="duotone" />, color: "#34d399", agents: [{ id: "6", name: "Rodrigo", role: "CFO" }] },
    { key: "comercial",  label: "Comercial",      icon: <Handshake size={14} weight="duotone" />, color: "#22d3ee", agents: [{ id: "7", name: "Mariana", role: "PM"  }] },
    { key: "tecnologia", label: "Tecnologia",     icon: <PhCpu size={14} weight="duotone" />, color: "#c084fc", agents: [
      { id: "4", name: "Enzo",   role: "Dev"      },
      { id: "3", name: "Lucas",  role: "Designer" },
      { id: "5", name: "Carla",  role: "Analyst"  },
      { id: "8", name: "Dexter", role: "AI"       },
    ]},
  ];

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "var(--bg-base)", overflow: "hidden", fontFamily: "var(--font-body)" }}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header
        style={{
          position: "relative",
          height: `${HEADER_H}px`, flexShrink: 0,
          display: cinema ? "none" : "flex",
          alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", gap: 12,
          background: "rgba(6,9,17,0.95)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          zIndex: 30,
        }}
        aria-label="Barra de navegação"
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
            <Sparkles size={13} />
          </div>
          <div>
            <p className="lbl-caps" style={{ color: "var(--text-1)", fontSize: 10.5, lineHeight: 1.15 }}>The Office · AI Workspace</p>
            <p className="lbl-micro" style={{ color: "var(--text-3)", marginTop: 1, fontSize: 8 }}>Agentes Autônomos em Tempo Real</p>
          </div>
        </div>

        {/* Mobile Header Centralized Chat Button */}
        <button
          onClick={() => setChatOpen(!isChatOpen)}
          aria-label={isChatOpen ? "Fechar Chat" : "Abrir Chat"}
          className="mobile-only-flex"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: isChatOpen ? "#2563eb" : "rgba(37,99,235,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
            color: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isChatOpen ? "0 0 12px rgba(37,99,235,0.6)" : "none",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            zIndex: 40,
          }}
        >
          <MessageCircle size={18} />
          {/* Glowing badge */}
          <span style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#fbbf24",
            border: "1.5px solid #2563eb",
            boxShadow: "0 0 6px #fbbf24"
          }} className="anim-pulse" />
        </button>

        {/* Center pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: "4px 8px" }} className="hidden-mobile">
          <Activity size={11} color="#34d399" />
          <span className="lbl-micro" style={{ color: "#34d399" }}>Rede Estável</span>
          <span className="sdot s-working anim-pulse-dot" />
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

          {/* Cameras toggle */}
          <HeaderBtn
            active={camsOpen}
            onClick={() => setCamsOpen(v => !v)}
            aria-label={camsOpen ? "Ocultar câmeras" : "Exibir câmeras"}
            aria-expanded={camsOpen}
            icon={camsOpen ? <Video size={13} /> : <VideoOff size={13} />}
            label="Câmeras"
            hideOnMobile
          />

          {/* Left sidebar */}
          <HeaderBtn
            active={leftOpen}
            onClick={() => setLeftOpen(v => !v)}
            aria-label={leftOpen ? "Fechar sidebar" : "Abrir departamentos"}
            aria-expanded={leftOpen}
            icon={leftOpen ? <PanelLeftClose size={13} /> : <PanelLeft size={13} />}
            label="Depts"
            hideOnMobile
          />

          {/* Right sidebar */}
          <HeaderBtn
            active={rightOpen}
            onClick={() => setRightOpen(v => !v)}
            aria-label={rightOpen ? "Fechar monitor" : "Abrir monitor"}
            aria-expanded={rightOpen}
            icon={rightOpen ? <PanelRightClose size={13} /> : <PanelRight size={13} />}
            label="Monitor"
            hideOnMobile
          />

          {/* Simulate */}
          <button
            onClick={() => {
              const a = agents[Math.floor(Math.random() * agents.length)];
              const opts: RoomId[] = ["recepcao","operacao","reuniao","lounge","diretoria"];
              const dest = opts.filter(r => r !== a.room)[Math.floor(Math.random() * 4)];
              useOfficeStore.getState().triggerAgentMove(a.id, dest);
            }}
            aria-label="Mover agente aleatório"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 10, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-ui)", cursor: "pointer", transition: "all 150ms" }}
          >
            <Shuffle size={13} />
            <span className="hidden-mobile">Simular</span>
          </button>

          {/* Cinema */}
          <button
            onClick={() => { setCinema(true); setLeftOpen(false); setRightOpen(false); setCamsOpen(false); }}
            aria-label="Modo foco total"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 10, background: "#2563eb", border: "1px solid rgba(59,130,246,0.4)", color: "white", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-ui)", cursor: "pointer" }}
          >
            <Eye size={13} />
            <span className="hidden-mobile">Foco</span>
          </button>
        </div>
      </header>

      {/* Cinema exit */}
      {cinema && (
        <button
          onClick={() => { setCinema(false); setLeftOpen(true); setRightOpen(true); }}
          aria-label="Sair do modo cinema"
          style={{ position: "fixed", top: 16, right: 16, zIndex: 100, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12, background: "rgba(11,15,26,0.95)", backdropFilter: "blur(16px)", border: "1px solid var(--border-md)", color: "var(--text-1)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          <EyeOff size={14} color="#60a5fa" /> Sair do Foco
        </button>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CAMERAS ROW (collapsible, desktop)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {!cinema && (
        <div
          style={{
            flexShrink: 0, overflow: "hidden",
            maxHeight: camsOpen ? `${CAMS_H}px` : "0px",
            transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
            background: "rgba(6,9,17,0.9)",
            borderBottom: camsOpen ? "1px solid var(--border)" : "none",
          }}
          aria-hidden={!camsOpen}
          className="desktop-only"
        >
          <div style={{ display: "flex", gap: 8, padding: "8px 16px", overflowX: "auto", alignItems: "center", height: `${CAMS_H}px` }}>
            {agents.map(agent => {
              const initials = agent.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
              const isSel = selectedAgentId === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => selectAgent(agent.id)}
                  aria-label={`${agent.name} — ${STATUS_LABEL[agent.status]}`}
                  aria-pressed={isSel}
                  style={{
                    flexShrink: 0, minWidth: 58,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    padding: "6px 4px", borderRadius: 8, cursor: "pointer",
                    background: isSel ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isSel ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.07)"}`,
                    transition: "all 150ms",
                  }}
                >
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, backgroundColor: `${agent.color}18`, borderColor: agent.color, color: agent.color, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {agent.avatarUrl ? (
                      <img src={agent.avatarUrl} alt={agent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className="lbl-micro" style={{ color: "var(--text-2)", maxWidth: 54, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 8.5 }}>
                    {agent.name.split(" ")[0]}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span className={`sdot ${STATUS_DOT[agent.status] ?? "s-offline"}`} style={{ width: 5, height: 5 }} />
                    <span className="lbl-micro" style={{ color: "var(--text-3)", fontSize: 7.5 }}>
                      {STATUS_LABEL[agent.status]?.slice(0, 5)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAIN WORKSPACE ROW (flex-1, contains sidebars + canvas)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ─── LEFT SIDEBAR ───────────────────────────────────────────────── */}
        <aside
          style={{
            width: `${leftW}px`,
            flexShrink: 0,
            overflow: "hidden",
            transition: isResizing ? "none" : "width 0.3s cubic-bezier(0.4,0,0.2,1)",
            borderRight: leftW > 0 ? "1px solid var(--border)" : "none",
          }}
          aria-label="Departamentos"
          aria-hidden={leftW === 0}
          className="desktop-only"
        >
          {/* Inner resizable container */}
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "rgba(8,11,20,0.92)", overflowY: "auto" }}>

            {/* Sidebar header */}
            <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(100,116,139,0.12)", border: "1px solid rgba(100,116,139,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>
                    <Users size={13} />
                  </div>
                  <span className="lbl-caps" style={{ color: "var(--text-1)" }}>Departamentos</span>
                </div>
                <span className="lbl-micro" style={{ color: "var(--text-3)", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", padding: "3px 7px", borderRadius: 6 }}>
                  {activeAgents} ativos
                </span>
              </div>
            </div>

            {/* Dept list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
              {DEPT_ITEMS.map(dept => (
                <div key={dept.key} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setDepts(p => ({ ...p, [dept.key]: !p[dept.key] }))}
                    aria-expanded={depts[dept.key]}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 4px", background: "none", border: "none", cursor: "pointer", color: dept.color }}
                    className="lbl-caps"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {dept.icon}
                      <span>{dept.label}</span>
                    </div>
                    {depts[dept.key] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>

                  {depts[dept.key] && (
                    <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 3 }} className="anim-fade-up">
                      {dept.agents.map(da => {
                        const live   = agents.find(a => a.id === da.id);
                        const dotCls = live ? (STATUS_DOT[live.status] ?? "s-offline") : "s-offline";
                        const isSel  = selectedAgentId === da.id;
                        return (
                          <button
                            key={da.id + dept.key}
                            onClick={() => selectAgent(da.id)}
                            aria-label={`${da.name} — ${da.role}`}
                            aria-pressed={isSel}
                            className={`card card-hover ${isSel ? "card-selected" : ""}`}
                            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", border: "none", cursor: "pointer", textAlign: "left" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span className={`sdot ${dotCls} anim-pulse-dot`} />
                              <div>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", fontFamily: "var(--font-ui)" }}>{da.name}</p>
                                <p className="lbl-micro" style={{ color: "var(--text-3)", marginTop: 1 }}>{da.role}</p>
                              </div>
                            </div>
                            {live && (
                              <span className="lbl-micro" style={{ color: dept.color, background: `${dept.color}12`, border: `1px solid ${dept.color}28`, padding: "2px 6px", borderRadius: 5 }}>
                                {STATUS_LABEL[live.status]?.slice(0, 5)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: "10px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              <div className="card" style={{ padding: "10px 12px", textAlign: "center" }}>
                <p className="lbl-micro" style={{ color: "var(--text-3)", marginBottom: 4 }}>Funcionários ativos</p>
                <p style={{ fontSize: 24, fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-ui)", lineHeight: 1 }}>1.142</p>
              </div>
            </div>
          </div>
        </aside>

        {/* LEFT RESIZE HANDLE */}
        {leftW > 0 && (
          <div
            onMouseDown={startLeftResize}
            style={{
              width: "4px",
              cursor: "col-resize",
              flexShrink: 0,
              zIndex: 35,
              background: "transparent",
              transition: "background 150ms",
              borderRight: "1px solid var(--border)",
              position: "relative",
            }}
            className="resize-handle"
          />
        )}

        {/* ─── CENTER: CANVAS + TOOLBAR ───────────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }} aria-label="Escritório virtual">
          {/* Canvas fills all remaining height */}
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <OfficeCanvas />
          </div>
          {/* Toolbar pinned at bottom */}
          {!cinema && <Toolbar />}
        </main>

        {/* RIGHT RESIZE HANDLE */}
        {rightW > 0 && (
          <div
            onMouseDown={startRightResize}
            style={{
              width: "4px",
              cursor: "col-resize",
              flexShrink: 0,
              zIndex: 35,
              background: "transparent",
              transition: "background 150ms",
              borderLeft: "1px solid var(--border)",
              position: "relative",
            }}
            className="resize-handle"
          />
        )}

        {/* ─── RIGHT SIDEBAR: HUD / AGENT PANEL ──────────────────────────── */}
        <aside
          style={{
            width: `${rightW}px`,
            flexShrink: 0,
            overflow: "hidden",
            transition: isResizing ? "none" : "width 0.3s cubic-bezier(0.4,0,0.2,1)",
            borderLeft: rightW > 0 ? "1px solid var(--border)" : "none",
          }}
          aria-label={selectedAgent ? `Painel — ${selectedAgent.name}` : "Monitor"}
          aria-hidden={rightW === 0}
          className="desktop-only"
        >
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "rgba(8,11,20,0.92)" }}>

            {selectedAgent ? (
              /* Agent Panel */
              <div className="anim-slide-in" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <AgentPanel />
              </div>
            ) : (
              /* HUD */
              <>
                <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="lbl-caps" style={{ color: "var(--text-1)" }}>Monitor</span>
                  {activeJobs > 0 && (
                    <span className="lbl-micro anim-pulse-dot" style={{ color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", padding: "3px 8px", borderRadius: 6 }}>
                      {activeJobs} job ativo
                    </span>
                  )}
                </div>

                <div style={{ padding: "8px 10px 0", flexShrink: 0 }}>
                  <div className="tab-list" role="tablist" style={{ overflow: "hidden" }}>
                    {([
                      { id: "ranking", icon: <Award  size={11} />, label: "Ranking" },
                      { id: "jobs",    icon: <Play   size={11} />, label: "Jobs"    },
                      { id: "aegis",   icon: <Shield size={11} />, label: "Aegis"   },
                    ] as const).map(t => {
                      const isSelected = hudTab === t.id;
                      return (
                        <button
                          key={t.id}
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => setHudTab(t.id)}
                          className="tab-btn"
                          style={{
                            flex: isSelected ? "2" : "1",
                            transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: isSelected ? "5px" : "0px",
                            overflow: "hidden",
                          }}
                        >
                          {t.icon}
                          {isSelected && (
                            <span className="anim-fade-up" style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2px", whiteSpace: "nowrap" }}>
                              {t.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                  <HudContent hudTab={hudTab} agents={agents} rooms={rooms} jobs={jobs} busy={busy} dispatch={dispatchJob} selectAgent={selectAgent} />
                </div>
              </>
            )}
          </div>
        </aside>

      </div>{/* end main row */}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MOBILE BOTTOM NAV
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav
        role="tablist"
        aria-label="Navegação mobile"
        style={{
          display: "none", // shown via CSS media query
          flexShrink: 0,
          height: 64,
          background: "rgba(8,11,20,0.98)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border-md)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        className="mobile-nav"
      >
        {([
          { id: "map",  icon: <Map size={22} />,            label: "Mapa",    badge: 0 },
          { id: "team", icon: <Users size={22} />,          label: "Agentes", badge: 0 },
          { id: "hud",  icon: <LayoutDashboard size={22} />, label: "HUD",     badge: activeJobs },
        ] as const).map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={mobileTab === t.id}
            aria-label={t.label}
            onClick={() => {
              setMobileTab(t.id);
              setSheetOpen(t.id !== "map");
              if (t.id === "map") setSheetOpen(false);
            }}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 3, background: "none", border: "none", cursor: "pointer",
              color: mobileTab === t.id ? "#60a5fa" : "var(--text-3)",
              fontSize: 9, fontFamily: "var(--font-ui)", fontWeight: 700,
              letterSpacing: "0.5px", textTransform: "uppercase",
              transition: "color 150ms", position: "relative",
              minHeight: 44,
            }}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge > 0 && (
              <span style={{ position: "absolute", top: 8, right: "calc(50% - 18px)", width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "white", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Mobile bottom sheet */}
      <div className={`bottom-sheet ${sheetOpen ? "open" : ""}`} role="dialog" aria-modal="false" aria-label="Painel mobile">
        <div
          onClick={() => setSheetOpen(false)}
          style={{ width: 36, height: 4, background: "rgba(148,163,184,0.25)", borderRadius: 99, margin: "10px auto 4px", cursor: "pointer", flexShrink: 0 }}
          role="button"
          aria-label="Fechar painel"
          tabIndex={0}
        />
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 20px" }}>
          {mobileTab === "team" && <AgentPanel />}
          {mobileTab === "hud" && (
            <div style={{ paddingTop: 8 }}>
              <div className="tab-list" role="tablist" style={{ marginBottom: 12 }}>
                {([
                  { id: "ranking", label: "Ranking" }, { id: "jobs", label: "Jobs" }, { id: "aegis", label: "Aegis" }
                ] as const).map(t => (
                  <button key={t.id} role="tab" aria-selected={hudTab === t.id} onClick={() => setHudTab(t.id)} className="tab-btn">
                    {t.label}
                  </button>
                ))}
              </div>
              <HudContent hudTab={hudTab} agents={agents} rooms={rooms} jobs={jobs} busy={busy} dispatch={dispatchJob} selectAgent={(id) => { selectAgent(id); setMobileTab("team"); }} />
            </div>
          )}
        </div>
      </div>

      {/* Chat widget */}
      <div style={{ opacity: cinema ? 0 : 1, pointerEvents: cinema ? "none" : "auto", transition: "opacity 200ms" }}>
        <ChatPanel rightSidebarOpen={rightOpen && !cinema} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function HeaderBtn({ active, onClick, icon, label, hideOnMobile, ...rest }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; hideOnMobile?: boolean; [k: string]: unknown
}) {
  return (
    <button
      onClick={onClick}
      {...rest}
      className={hideOnMobile ? "desktop-only" : ""}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "4px 8px", borderRadius: 7, cursor: "pointer",
        background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.07)"}`,
        color: active ? "#60a5fa" : "var(--text-3)",
        fontSize: 10.5, fontWeight: 700, fontFamily: "var(--font-ui)",
        transition: "all 150ms",
      }}
    >
      {icon}
      <span className="hidden-mobile">{label}</span>
    </button>
  );
}

function HudContent({ hudTab, agents, rooms, jobs, busy, dispatch, selectAgent }: {
  hudTab: string; agents: any[]; rooms: any[]; jobs: JobItem[]; busy: boolean;
  dispatch: () => void; selectAgent: (id: string) => void;
}) {
  if (hudTab === "ranking") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="anim-fade-up">
      {/* Podium */}
      <div className="card" style={{ padding: "12px" }}>
        <p className="lbl-micro" style={{ color: "var(--text-3)", marginBottom: 10 }}>Top 3 — Eficiência</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 10, height: 90 }}>
          {[
            { rank: 2, name: "Amanda", h: 52, color: "#94a3b8" },
            { rank: 1, name: "Enzo S.", h: 76, color: "#fbbf24" },
            { rank: 3, name: "Lucas",  h: 40, color: "#f97316" },
          ].map(p => (
            <div key={p.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span className="lbl-micro" style={{ color: p.color }}>#{p.rank}</span>
              <div style={{ width: 44, height: p.h, background: p.rank === 1 ? "rgba(59,130,246,0.3)" : "rgba(71,85,105,0.3)", border: `1px solid ${p.color}40`, borderRadius: "8px 8px 0 0", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 5 }}>
                <span className="lbl-micro" style={{ color: "var(--text-2)" }}>P{p.rank}</span>
              </div>
              <span className="lbl-micro" style={{ color: "var(--text-3)" }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {agents.map((agent, i) => {
          const eff  = Math.max(12, 95 - i * 6);
          const room = rooms.find((r: any) => r.id === agent.room)?.name;
          const ini  = agent.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
          return (
            <button key={agent.id} onClick={() => selectAgent(agent.id)} aria-label={`${agent.name}`} className="card card-hover" style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: "none", cursor: "pointer", textAlign: "left" }}>
              <span className="lbl-micro" style={{ color: "var(--text-3)", width: 14 }}>{i + 1}</span>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, backgroundColor: `${agent.color}18`, borderColor: agent.color, color: agent.color, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {agent.avatarUrl ? (
                  <img src={agent.avatarUrl} alt={agent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  ini
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.name}</p>
                <p className="lbl-micro" style={{ color: "var(--text-3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="prog-track" style={{ width: 48, marginBottom: 3 }}>
                  <div className="prog-fill" style={{ width: `${eff}%` }} />
                </div>
                <span className="lbl-micro" style={{ color: "#60a5fa" }}>{eff}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (hudTab === "jobs") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="anim-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p className="lbl-micro" style={{ color: "var(--text-3)" }}>Fila de orquestração</p>
        <button
          onClick={dispatch}
          disabled={busy}
          aria-label="Despachar novo job"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 9, background: "#1d4ed8", border: "1px solid rgba(59,130,246,0.4)", color: "white", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-ui)", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.5 : 1 }}
        >
          <PlusCircle size={12} />
          {busy ? "…" : "Despachar"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {jobs.map(job => {
          const statusStyle: Record<string, { label: string; color: string; bg: string }> = {
            pending:   { label: "Pendente",    color: "#fbbf24", bg: "rgba(251,191,36,0.08)" },
            running:   { label: "Rodando",     color: "#60a5fa", bg: "rgba(96,165,250,0.08)" },
            completed: { label: "Concluído",   color: "#34d399", bg: "rgba(52,211,153,0.08)" },
          };
          const prioColor: Record<string, string> = { Alta: "#f87171", Média: "#fbbf24", Baixa: "#94a3b8" };
          const s = statusStyle[job.status];
          return (
            <button key={job.id} onClick={() => selectAgent(job.agentId)} aria-label={`Job: ${job.title}`} className="card card-hover" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7, padding: "10px 12px", border: "none", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</p>
                  <p className="lbl-micro" style={{ color: "var(--text-3)", marginTop: 2 }}>por <b style={{ color: "var(--text-2)" }}>{job.agentName.split(" ")[0]}</b></p>
                </div>
                <span className="lbl-micro" style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}30`, padding: "3px 7px", borderRadius: 6, flexShrink: 0 }}>{s.label}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 6 }}>
                <span className="lbl-micro" style={{ color: "var(--text-3)" }}>{job.timestamp}</span>
                <span className="lbl-micro" style={{ color: prioColor[job.priority], background: `${prioColor[job.priority]}15`, border: `1px solid ${prioColor[job.priority]}30`, padding: "2px 6px", borderRadius: 5 }}>{job.priority}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  /* aegis */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="anim-fade-up">
      <div className="card" style={{ padding: "12px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399", flexShrink: 0, boxShadow: "0 0 16px rgba(16,185,129,0.2)" }}>
          <Shield size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-ui)" }}>Escudo Aegis</p>
          <p className="lbl-micro" style={{ color: "var(--text-3)", marginTop: 2 }}>AEGIS CONTROL PLATFORM</p>
        </div>
        <span className="lbl-micro anim-pulse-dot" style={{ color: "#34d399", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", padding: "3px 8px", borderRadius: 6 }}>ATIVO</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { icon: <Coins size={11} color="#fbbf24" />, label: "Custos Hoje",  value: "$12.84",   sub: "Limite: $100.00" },
          { icon: <BarChart3 size={11} color="#60a5fa" />, label: "Vazão",    value: "14.2K t/s", sub: "Tokens/seg" },
          { icon: <Database size={11} color="#34d399" />, label: "Cache Hit", value: "82.4%",    sub: "Econ: $4.50" },
          { icon: <Lock size={11} color="#c084fc" />, label: "Trust Score",   value: "99.2%",    sub: "Credenciais: OK" },
        ].map((m, i) => (
          <div key={i} className="card" style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }} className="lbl-micro" >
              {m.icon} <span style={{ color: "var(--text-3)" }}>{m.label}</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-ui)", lineHeight: 1 }}>{m.value}</p>
            <p className="lbl-micro" style={{ color: "var(--text-3)" }}>{m.sub}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="lbl-micro" style={{ color: "var(--text-3)", marginBottom: 6 }}>Logs de auditoria</p>
        <div className="console" style={{ height: 130 }}>
          <div style={{ color: "#34d399" }}>[12:15:30] [AEGIS] Prompt Audit: PASS</div>
          <div style={{ color: "#60a5fa" }}>[12:18:12] [SYS] MCP Tool: read_file approved</div>
          <div style={{ color: "#34d399" }}>[12:20:45] [AEGIS] Secrets check: 0 leaks</div>
          <div style={{ color: "#fbbf24" }}>[12:22:10] [WARN] Cache invalidation: CS session</div>
          <div style={{ color: "#34d399" }}>[12:25:39] [AEGIS] Neural sync: SUCCESS 99.2%</div>
        </div>
      </div>
    </div>
  );
}
