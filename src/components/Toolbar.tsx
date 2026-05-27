import React from "react";
import { useOfficeStore } from "../store/useOfficeStore";
import { Users, MessageCircle, LayoutDashboard } from "lucide-react";

interface ToolbarProps {
  leftOpen: boolean;
  setLeftOpen: (v: boolean) => void;
  rightOpen: boolean;
  setRightOpen: (v: boolean) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ leftOpen, setLeftOpen, rightOpen, setRightOpen }) => {
  const { isChatOpen, setChatOpen } = useOfficeStore();

  return (
    <div style={{ position: "relative" }}>
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
          
          {/* Item 1: Salas (Moved to header on desktop) */}
          <div style={{ width: "100%" }} />

          {/* Item 2: Equipe */}
          <button 
            onClick={() => setLeftOpen(!leftOpen)} 
            aria-pressed={leftOpen}
            className={`desktop-nav-item ${leftOpen ? "active" : ""}`}
          >
            <Users size={16} />
            <span>Equipe</span>
          </button>

          {/* Item 3: Centered transparent Chat Button (only desktop) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <button
              onClick={() => setChatOpen(!isChatOpen)}
              aria-pressed={isChatOpen}
              style={{
                background: "transparent",
                border: "none",
                color: isChatOpen ? "#60a5fa" : "var(--text-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 150ms ease",
                padding: "8px",
                borderRadius: "50%",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-2)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isChatOpen ? "#60a5fa" : "var(--text-3)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              title="Abrir Chat"
            >
              <MessageCircle size={20} />
            </button>
          </div>

          {/* Item 4: Ações (Moved to header on desktop) */}
          <div style={{ width: "100%" }} />

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
