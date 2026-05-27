import React, { useState } from "react";
import { useOfficeStore } from "../store/useOfficeStore";
import type { RoomId } from "../types/agent";
import { Briefcase, Users, Coffee, MapPin, Layout, Crosshair, Minimize2, MessageCircle } from "lucide-react";

const ROOM_ICONS: Record<string, React.ReactNode> = {
  recepcao:  <MapPin    size={12} />,
  operacao:  <Briefcase size={12} />,
  diretoria: <Layout    size={12} />,
  reuniao:   <Users     size={12} />,
  lounge:    <Coffee    size={12} />,
};

export const Toolbar: React.FC = () => {
  const { rooms, selectedRoomId, selectRoom, selectAgent, agents, triggerAgentMove, 
    cameraAutoFocus, setCameraAutoFocus, resetCamera, isChatOpen, setChatOpen } = useOfficeStore();

  const [activeMenu, setActiveMenu] = useState<"salas" | "acoes" | "camera" | null>(null);

  const toggleMenu = (menu: "salas" | "acoes" | "camera") => {
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

      {activeMenu === "camera" && (
        <div 
          style={{ 
            position: "absolute", bottom: 56, right: "calc(50% - 190px)", 
            background: "rgba(6, 10, 18, 0.95)", border: "1px solid rgba(255,255,255,0.08)", 
            borderRadius: "var(--r-md)", padding: "10px", display: "flex", flexDirection: "column", gap: 4, 
            zIndex: 100, boxShadow: "0 10px 30px rgba(0,0,0,0.6)", minWidth: 150,
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)"
          }}
          className="anim-fade-up"
        >
          <p className="lbl-micro" style={{ color: "var(--text-3)", padding: "2px 6px 6px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", marginBottom: 4 }}>Câmera</p>
          <button 
            onClick={() => setCameraAutoFocus(!cameraAutoFocus)} 
            style={{ ...btn(cameraAutoFocus, "#3b82f6"), width: "100%" }}
          >
            <Crosshair size={12} className={cameraAutoFocus ? "animate-pulse" : ""} />
            <span>Foco: {cameraAutoFocus ? "Automático" : "Manual"}</span>
          </button>
          <button 
            onClick={() => runAction(resetCamera)} 
            style={{ ...btn(false, "#64748b"), width: "100%" }}
          >
            <Minimize2 size={12} />
            <span>Visão Geral</span>
          </button>
        </div>
      )}

      {/* Main Taskbar/Toolbar */}
      <nav
        role="toolbar"
        aria-label="Controles do escritório"
        style={{
          height: 48, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          padding: "0 16px",
          background: "rgba(4,6,14,0.96)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Left triggers: Salas and Ações */}
        <div style={{ display: "flex", gap: 8 }}>
          <button 
            onClick={() => toggleMenu("salas")} 
            aria-pressed={activeMenu === "salas"}
            style={btn(activeMenu === "salas", "#3b82f6")}
          >
            <MapPin size={12} />
            <span>Salas</span>
          </button>

          <button 
            onClick={() => toggleMenu("acoes")} 
            aria-pressed={activeMenu === "acoes"}
            style={btn(activeMenu === "acoes", "#3b82f6")}
          >
            <Layout size={12} />
            <span>Ações</span>
          </button>
        </div>

        {/* Center: Centered highlighted round blue Chat Button */}
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

        {/* Right triggers: Câmera */}
        <div style={{ display: "flex", gap: 8 }}>
          <button 
            onClick={() => toggleMenu("camera")} 
            aria-pressed={activeMenu === "camera"}
            style={btn(activeMenu === "camera", "#3b82f6")}
          >
            <Crosshair size={12} />
            <span>Câmera</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
