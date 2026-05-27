import React, { useEffect, useRef, useState } from "react";
import { useOfficeStore } from "../game/../store/useOfficeStore";
import { initPixiApp } from "../game/pixiApp";
import type { PixiAppInstance } from "../game/pixiApp";
import { setupOfficeScene } from "../game/officeScene";
import { setupAgents, AgentToken } from "../game/agents";
import { createCameraController } from "../game/interactions";
import type { CameraController } from "../game/interactions";
import type { RoomId } from "../types/agent";
import { HelpCircle } from "lucide-react";

const HINT_KEY = "office_hint_seen";

export const OfficeCanvas: React.FC = () => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const pixiRef       = useRef<PixiAppInstance | null>(null);
  const cameraRef     = useRef<CameraController | null>(null);
  const tokensRef     = useRef<Record<string, AgentToken>>({});
  const cleanupRef    = useRef<(() => void) | null>(null);

  const [showHint,  setShowHint]    = useState(false);

  const { agents, rooms, selectedAgentId, selectedRoomId, selectAgent, selectRoom,
    updateAgentPosition, setAgentTargetPosition, addAgentLog, cameraAutoFocus, triggerCameraReset } = useOfficeStore();

  // Show hint on first visit
  useEffect(() => {
    if (!localStorage.getItem(HINT_KEY)) {
      setShowHint(true);
      const t = setTimeout(() => { setShowHint(false); localStorage.setItem(HINT_KEY, "1"); }, 5000);
      return () => clearTimeout(t);
    }
  }, []);

  // Init PixiJS
  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;
    let pixiApp: PixiAppInstance | null = null;

    const start = async () => {
      try {
        pixiApp = await initPixiApp(containerRef.current!);
        if (destroyed) { pixiApp.destroy(); return; }
        pixiRef.current = pixiApp;
        const { app } = pixiApp;

        const camera = createCameraController(app.stage, 1200, 675);
        cameraRef.current = camera;
        const cleanup = camera.attachToCanvas(app.canvas, app);
        cleanupRef.current = cleanup;

        await setupOfficeScene(app.stage, 1200, 675, (roomId: RoomId) => {
          selectRoom(roomId);
          const a = useOfficeStore.getState().agents.find(ag => ag.room === roomId);
          selectAgent(a ? a.id : null);
        });

        const tokens = setupAgents(app.stage, agents, (id: string) => selectAgent(id));
        tokensRef.current = tokens;

        app.ticker.add((ticker) => {
          Object.values(tokensRef.current).forEach(token => {
            token.update(ticker.deltaTime, (agentId: string) => {
              const t = tokensRef.current[agentId];
              if (!t) return;
              updateAgentPosition(agentId, t.agentData.position);
              setAgentTargetPosition(agentId, null);
              const roomName = rooms.find(r => r.id === t.agentData.room)?.name;
              addAgentLog(agentId, `Chegou: ${roomName}`);
            });
          });
          cameraRef.current?.update(ticker.deltaTime);
        });
      } catch (err) {
        console.error("Erro PixiJS:", err);
      }
    };
    start();
    return () => { destroyed = true; cleanupRef.current?.(); pixiApp?.destroy(); };
  }, []);

  // Sync agent visuals
  useEffect(() => {
    agents.forEach(agent => tokensRef.current[agent.id]?.updateAgentData(agent));
  }, [agents]);

  // Auto-focus camera setting
  useEffect(() => {
    if (!cameraRef.current) return;
    cameraRef.current.setAutoFocus(cameraAutoFocus);
  }, [cameraAutoFocus]);

  // Auto-focus zoom on selection
  useEffect(() => {
    if (!cameraRef.current || !cameraAutoFocus) return;
    if (selectedAgentId) {
      const agent = agents.find(a => a.id === selectedAgentId);
      if (agent) { cameraRef.current.zoomTo(agent.position.x, agent.position.y, 1.5); }
    } else if (selectedRoomId) {
      const room = rooms.find(r => r.id === selectedRoomId);
      if (room) { cameraRef.current.zoomTo(room.centerPos.x, room.centerPos.y, 1.25); }
    }
  }, [selectedAgentId, selectedRoomId, agents, rooms, cameraAutoFocus]);

  // Handle camera reset trigger from store
  useEffect(() => {
    if (!cameraRef.current || triggerCameraReset === 0) return;
    cameraRef.current.reset();
  }, [triggerCameraReset]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "#050810", overflow: "hidden" }}>

      {/* Canvas */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} aria-label="Escritório virtual isométrico" role="img" />



      {/* First-time hint overlay */}
      {showHint && (
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 glass px-4 py-3 rounded-xl text-center animate-fade-in z-30 pointer-events-none"
          aria-live="polite"
          role="status"
        >
          <p className="text-slate-300 text-xs font-semibold mb-1 flex items-center gap-2 justify-center">
            <HelpCircle size={13} className="text-blue-400" />
            Navegando no escritório
          </p>
          <p className="text-slate-500 text-[11px]">
            Arraste para mover · Scroll para zoom · Duplo clique para aproximar
          </p>
        </div>
      )}
    </div>
  );
};
