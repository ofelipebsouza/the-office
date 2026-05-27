import React, { useState } from "react";
import { useOfficeStore } from "../store/useOfficeStore";
import type { RoomId } from "../types/agent";
import { Briefcase, Users, Coffee, MapPin, Layout, MessageCircle, LayoutDashboard } from "lucide-react";

const ROOM_ICONS: Record<string, React.ReactNode> = {
  recepcao:  <MapPin    size={12} />,
  operacao:  <Briefcase size={12} />,
  diretoria: <Layout    size={12} />,
  reuniao:   <Users     size={12} />,
  lounge:    <Coffee    size={12} />,
};

interface ToolbarProps {
  leftOpen: boolean;
  setLeftOpen: (v: boolean) => void;
  rightOpen: boolean;
  setRightOpen: (v: boolean) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ leftOpen, setLeftOpen, rightOpen, setRightOpen }) => {
  const { rooms, selectedRoomId, selectRoom, selectAgent, agents, triggerAgentMove, 
    isChatOpen, setChatOpen } = useOfficeStore();

  const [activeMenu, setActiveMenu] = useState<"salas" | "acoes" | null>(null);

  const toggleMenu = (menu: "salas" | "acoes") => {
    setActiveMenu(prev => prev === menu ? null : menu);
  };

  const handleRoom = (id: RoomId | null) => { 
    selectRoom(id); 
    selectAgent(null); 
    setActiveMenu(null);
  };

  const runAction = (actionFn: () => void) => {
    actionFn();
    setActiveMenu(null);
  };

  const convocarReuniao  = () => agents.forEach(a => triggerAgentMove(a.id, "reuniao"));
  const horaDoCafe       = () => agents.forEach(a => triggerAgentMove(a.id, "lounge"));
  const voltarAoTrabalho = () => agents.forEach(a => {
    if (a.id === "1") triggerAgentMove(a.id, "diretoria");
    else if (a.id === "2") triggerAgentMove(a.id, "recepcao");
    else triggerAgentMove(a.id, "operacao");
  });
  const count = (id: string) => agents.filter(a => a.room === id).length;

  const btn = (active: boolean, accent: string) => ({
    display: "flex" as const, alignItems: "center" as const, gap: 5,
    padding: "4.5px 10px", borderRadius: 7, cursor: "pointer" as const,
    fontSize: 10.5, fontWeight: 700, fontFamily: "var(--font-ui)",
    flexShrink: 0, whiteSpace: "nowrap" as const,
    border: `1px solid ${active ? `${accent}50` : "rgba(255,255,255,0.07)"}`,
    background: active ? `${accent}18` : "rgba(255,255,255,0.04)",
    color: active ? accent : "var(--text-3)",
    transition: "all 150ms",
  });

  return (
    <div style={{ position: "relative" }}>
      {/* Click outside overlay */}
      {activeMenu && (
        <div 
          onClick={() => setActiveMenu(null)}
          style={{ position: "fixed", inset: 0, zIndex: 90, background: "transparent" }}
        />
      )}

      {/* Floating Menus (Windows 11 System Tray style) */}
      {activeMenu === "salas" && (
        <div 
          style={{ 
            position: "absolute", bottom: 56, left: "calc(50% - 190px)", 
            background: "rgba(6, 10, 18, 0.95)", border: "1px solid rgba(255,255,255,0.08)", 
            borderRadius: "var(--r-md)", padding: "10px", display: "flex", flexDirection: "column", gap: 4, 
            zIndex: 100, boxShadow: "0 10px 30px rgba(0,0,0,0.6)", minWidth: 160,
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)"
          }}
          className="anim-fade-up"
        >
          <p className="lbl-micro" style={{ color: "var(--text-3)", padding: "2px 6px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 4 }}>Salas</p>
          <button onClick={() => handleRoom(null)} style={{ ...btn(selectedRoomId === null, "#3b82f6"), width: "100%", justifyContent: "flex-start" }}>
            <span>Geral (Visão Global)</span>
          </button>
          {rooms.map(room => {
            const sel = selectedRoomId === room.id;
            const n   = count(room.id);
            return (
              <button
                key={room.id}
                onClick={() => handleRoom(room.id as RoomId)}
                style={{ ...btn(sel, "#3b82f6"), width: "100%", justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {ROOM_ICONS[room.id] ?? null}
                  <span>{room.name}</span>
                </div>
                {n > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 900, padding: "1px 5px", borderRadius: 4, background: sel ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.08)", color: sel ? "#bfdbfe" : "var(--text-3)" }}>
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {activeMenu === "acoes" && (
        <div 
          style={{ 
            position: "absolute", bottom: 56, left: "calc(50% - 90px)", 
            background: "rgba(6, 10, 18, 0.95)", border: "1px solid rgba(255,255,255,0.08)", 
            borderRadius: "var(--r-md)", padding: "10px", display: "flex", flexDirection: "column", gap: 4, 
            zIndex: 100, boxShadow: "0 10px 30px rgba(0,0,0,0.6)", minWidth: 140,
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)"
          }}
          className="anim-fade-up"
        >
          <p className="lbl-micro" style={{ color: "var(--text-3)", padding: "2px 6px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 4 }}>Ações Coletivas</p>
          <button onClick={() => runAction(voltarAoTrabalho)} style={{ ...btn(false, "#10b981"), width: "100%" }}>
            <Briefcase size={12} /> <span>Trabalhar</span>
          </button>
          <button onClick={() => runAction(convocarReuniao)} style={{ ...btn(false, "#06b6d4"), width: "100%" }}>
            <Users size={12} /> <span>Reunião</span>
          </button>
          <button onClick={() => runAction(horaDoCafe)} style={{ ...btn(false, "#818cf8"), width: "100%" }}>
            <Coffee size={12} /> <span>Hora do Café</span>
          </button>
        </div>
      )}

      {/* Main Taskbar/Toolbar */}
      <nav
        role="toolbar"
        aria-label="Controles do escritório"
        style={{
          height: 56, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 16px",
          background: "rgba(4,6,14,0.96)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          width: "100%",
          maxWidth: "540px",
          columnGap: "24px",
          alignItems: "center",
          justifyItems: "center",
        }}>
          
          {/* Item 1: Salas */}
          <button 
            onClick={() => toggleMenu("salas")} 
            aria-pressed={activeMenu === "salas"}
            className={`desktop-nav-item ${activeMenu === "salas" ? "active" : ""}`}
          >
            <MapPin size={16} />
            <span>Salas</span>
          </button>

          {/* Item 2: Equipe */}
          <button 
            onClick={() => setLeftOpen(!leftOpen)} 
            aria-pressed={leftOpen}
            className={`desktop-nav-item ${leftOpen ? "active" : ""}`}
          >
            <Users size={16} />
            <span>Equipe</span>
          </button>

          {/* Item 3: Centered highlighted round blue Chat Button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <button
              onClick={() => setChatOpen(!isChatOpen)}
              aria-pressed={isChatOpen}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                border: "1px solid rgba(59,130,246,0.4)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(37,99,235,0.45)",
                cursor: "pointer",
                transition: "all 200ms ease",
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1d4ed8";
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(37,99,235,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.45)";
              }}
              title="Abrir Chat (Estilo Menu Iniciar)"
            >
              <MessageCircle size={18} />
            </button>
          </div>

          {/* Item 4: Ações */}
          <button 
            onClick={() => toggleMenu("acoes")} 
            aria-pressed={activeMenu === "acoes"}
            className={`desktop-nav-item ${activeMenu === "acoes" ? "active" : ""}`}
          >
            <Layout size={16} />
            <span>Ações</span>
          </button>

          {/* Item 5: HUD */}
          <button 
            onClick={() => setRightOpen(!rightOpen)} 
            aria-pressed={rightOpen}
            className={`desktop-nav-item ${rightOpen ? "active" : ""}`}
          >
            <LayoutDashboard size={16} />
            <span>HUD</span>
          </button>

        </div>
      </nav>
    </div>
  );
};
