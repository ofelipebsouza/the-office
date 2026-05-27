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
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#2563eb",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
            outline: "none",
            boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1d4ed8";
            e.currentTarget.style.transform = "scale(1.04) translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(37, 99, 235, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2563eb";
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(37, 99, 235, 0.4)";
          }}
          title="Abrir Chat"
        >
          <MessageCircle size={22} />
        </button>
      </nav>
    </div>
  );
};
