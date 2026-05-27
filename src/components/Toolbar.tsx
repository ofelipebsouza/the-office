import React from "react";
import { useOfficeStore } from "../store/useOfficeStore";
import type { RoomId } from "../types/agent";
import { Briefcase, Users, Coffee, MapPin, Layout, Crosshair, Minimize2 } from "lucide-react";

const ROOM_ICONS: Record<string, React.ReactNode> = {
  recepcao:  <MapPin    size={12} />,
  operacao:  <Briefcase size={12} />,
  diretoria: <Layout    size={12} />,
  reuniao:   <Users     size={12} />,
  lounge:    <Coffee    size={12} />,
};

export const Toolbar: React.FC = () => {
  const { rooms, selectedRoomId, selectRoom, selectAgent, agents, triggerAgentMove, 
    cameraAutoFocus, setCameraAutoFocus, resetCamera } = useOfficeStore();

  const handleRoom = (id: RoomId | null) => { selectRoom(id); selectAgent(null); };
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
    padding: "4px 10px", borderRadius: 7, cursor: "pointer" as const,
    fontSize: 10.5, fontWeight: 700, fontFamily: "var(--font-ui)",
    flexShrink: 0, whiteSpace: "nowrap" as const,
    border: `1px solid ${active ? `${accent}50` : "rgba(255,255,255,0.07)"}`,
    background: active ? `${accent}18` : "rgba(255,255,255,0.04)",
    color: active ? accent : "var(--text-3)",
    transition: "all 150ms",
  });

  return (
    <nav
      role="toolbar"
      aria-label="Controles do escritório"
      style={{
        height: 44, flexShrink: 0,
        display: "flex", alignItems: "center", gap: 5,
        padding: "0 10px",
        background: "rgba(4,6,14,0.96)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        overflowX: "auto",
      }}
    >
      {/* Separator label */}
      <span className="lbl-micro hidden-mobile" style={{ color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginRight: 4 }} aria-hidden>
        <MapPin size={11} /> Salas
      </span>

      {/* Geral */}
      <button
        onClick={() => handleRoom(null)}
        aria-pressed={selectedRoomId === null}
        aria-label="Visão geral"
        style={btn(selectedRoomId === null, "#3b82f6")}
      >
        Geral
      </button>

      {/* Rooms */}
      {rooms.map(room => {
        const sel = selectedRoomId === room.id;
        const n   = count(room.id);
        return (
          <button
            key={room.id}
            onClick={() => handleRoom(room.id as RoomId)}
            aria-pressed={sel}
            aria-label={`${room.name} — ${n} agente${n !== 1 ? "s" : ""}`}
            style={{ ...btn(sel, "#3b82f6") }}
          >
            {ROOM_ICONS[room.id] ?? null}
            <span>{room.name.split(" ")[0]}</span>
            {n > 0 && (
              <span style={{ fontSize: 10, fontWeight: 900, padding: "1px 6px", borderRadius: 5, background: sel ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.08)", color: sel ? "#bfdbfe" : "var(--text-3)" }}>
                {n}
              </span>
            )}
          </button>
        );
      })}

      {/* Divider */}
      <span className="hidden-mobile" style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 4px", flexShrink: 0 }} aria-hidden />
      <span className="lbl-micro hidden-mobile" style={{ color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginRight: 4 }} aria-hidden>
        <Layout size={11} /> Ações
      </span>

      {/* Actions */}
      <button onClick={voltarAoTrabalho} aria-label="Todos ao trabalho" style={btn(false, "#10b981")}>
        <Briefcase size={12} /> <span>Trabalhar</span>
      </button>
      <button onClick={convocarReuniao} aria-label="Convocar reunião" style={btn(false, "#06b6d4")}>
        <Users size={12} /> <span>Reunião</span>
      </button>
      <button onClick={horaDoCafe} aria-label="Hora do café" style={btn(false, "#818cf8")}>
        <Coffee size={12} /> <span>Café</span>
      </button>

      {/* Divider */}
      <span className="hidden-mobile" style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 4px", flexShrink: 0 }} aria-hidden />
      <span className="lbl-micro hidden-mobile" style={{ color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginRight: 4 }} aria-hidden>
        <Crosshair size={11} /> Câmera
      </span>

      {/* Auto-focus */}
      <button 
        onClick={() => setCameraAutoFocus(!cameraAutoFocus)} 
        aria-pressed={cameraAutoFocus} 
        style={btn(cameraAutoFocus, "#3b82f6")}
      >
        <Crosshair size={12} className={cameraAutoFocus ? "animate-pulse" : ""} />
        <span>{cameraAutoFocus ? "Auto" : "Manual"}</span>
      </button>

      {/* Reset */}
      <button 
        onClick={resetCamera} 
        style={btn(false, "#64748b")}
        title="Resetar câmera para visão geral"
      >
        <Minimize2 size={12} />
        <span>Visão Geral</span>
      </button>
    </nav>
  );
};
