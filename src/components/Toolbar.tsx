import React from "react";
import { useOfficeStore } from "../store/useOfficeStore";
import { MessageCircle } from "lucide-react";

export const Toolbar: React.FC = () => {
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
          background: "transparent",
          border: "none",
        }}
      >
        <button
          onClick={() => setChatOpen(!isChatOpen)}
          aria-pressed={isChatOpen}
          style={{
            background: "transparent",
            border: "none",
            color: "#2563eb", /* highlighted blue icon */
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 150ms ease",
            padding: "8px",
            borderRadius: "50%",
            outline: "none",
            filter: "drop-shadow(0 0 8px rgba(37,99,235,0.4))",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#60a5fa";
            e.currentTarget.style.transform = "scale(1.15)";
            e.currentTarget.style.filter = "drop-shadow(0 0 12px rgba(37,99,235,0.6))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#2563eb";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(37,99,235,0.4))";
          }}
          title="Abrir Chat"
        >
          <MessageCircle size={24} />
        </button>
      </nav>
    </div>
  );
};
