import { Container, Graphics, Text, TextStyle } from "pixi.js";
import type { VirtualAgent, AgentStatus } from "../types/agent";

export class AgentToken extends Container {
  public agentData: VirtualAgent;
  private ring: Graphics;
  private core: Container;
  private nameTag: Container;
  private bubble: Container;
  private bubbleText: Text;
  
  private pulseTime = 0;
  private walkTime = 0;
  
  // Status Colors
  private statusColors: Record<AgentStatus, number> = {
    working: 0x10b981,  // Green
    thinking: 0xf59e0b, // Amber
    chatting: 0x3b82f6, // Blue
    meeting: 0x06b6d4,  // Cyan
    offline: 0x6b7280,  // Gray
    idle: 0xe2e8f0      // Light gray/white
  };

  constructor(agent: VirtualAgent, onClick: () => void) {
    super();
    this.agentData = agent;
    this.x = agent.position.x;
    this.y = agent.position.y;

    this.interactive = true;
    this.cursor = "pointer";
    this.on("pointerdown", onClick);

    // 1. Draw Ring Glow (Shadow / Pulsing Base)
    this.ring = new Graphics();
    this.addChild(this.ring);

    // 2. Core Avatar Container (Cute Procedural Chibi Character)
    this.core = new Container();
    this.addChild(this.core);

    const chibi = new Graphics();
    const primaryColor = this.hexStringToNumber(agent.color);

    // 2a. Shadow base under feet
    chibi.ellipse(0, 10, 12, 4);
    chibi.fill({ color: 0x090d16, alpha: 0.45 });

    // 2b. Legs & Shoes
    chibi.roundRect(-4.5, 3, 3, 7, 1);
    chibi.roundRect(1.5, 3, 3, 7, 1);
    chibi.fill({ color: 0x1e293b }); // Pants color

    chibi.roundRect(-5.5, 8, 4, 3, 1);
    chibi.roundRect(1.5, 8, 4, 3, 1);
    chibi.fill({ color: 0x0f172a }); // Shoes color

    // 2c. Torso / Shirt / Suit
    chibi.roundRect(-6.5, -6, 13, 10, 2);
    chibi.fill({ color: primaryColor });

    // 2d. Arms
    chibi.roundRect(-8.5, -5, 2.5, 7, 1);
    chibi.roundRect(6, -5, 2.5, 7, 1);
    chibi.fill({ color: primaryColor });

    // 2e. Head & Skin
    const isRobot = agent.id === "8";
    const skinColor = isRobot ? 0x475569 : 0xffddc1;
    chibi.circle(0, -11, 6);
    chibi.fill({ color: skinColor });

    // 2f. Facial Features (Glowing Eyes)
    const eyeColor = isRobot ? 0x22d3ee : 0x0f172a;
    chibi.circle(-2, -11.5, isRobot ? 1.2 : 0.85);
    chibi.circle(2, -11.5, isRobot ? 1.2 : 0.85);
    chibi.fill({ color: eyeColor });

    // 2g. Hair & Accessories
    if (agent.id === "1") { // Sarah: CEO Pink Hair
      chibi.arc(0, -12, 6.5, Math.PI, 0); // top hair cap
      chibi.fill({ color: 0xec4899 });
      chibi.rect(-6.5, -12, 13, 4);
      chibi.fill({ color: 0xec4899 });
      // Ponytail bangs
      chibi.roundRect(-7.5, -11, 2.5, 7, 1);
      chibi.roundRect(5, -11, 2.5, 7, 1);
      chibi.fill({ color: 0xec4899 });
    } else if (agent.id === "2") { // Amanda: Support Blond Hair + Headset
      chibi.arc(0, -12, 6.5, Math.PI, 0);
      chibi.fill({ color: 0xfde047 });
      // Headset band
      chibi.arc(0, -11, 7.2, Math.PI, 0);
      chibi.stroke({ color: 0x64748b, width: 1.5 });
      // Earpiece mic
      chibi.circle(-7.2, -11, 1.8);
      chibi.fill({ color: 0x06b6d4 });
      chibi.moveTo(-7.2, -11);
      chibi.lineTo(-2, -7);
      chibi.stroke({ color: 0x06b6d4, width: 1 });
    } else if (agent.id === "3") { // Lucas: Designer Purple Spiky Hair
      chibi.arc(0, -12, 6.5, Math.PI, 0);
      chibi.fill({ color: 0xa855f7 });
      // Spikes
      chibi.poly([-4, -18, -1, -17, -2, -21]);
      chibi.poly([0, -18, 3, -17, 2, -21]);
      chibi.fill({ color: 0xa855f7 });
    } else if (agent.id === "4") { // Enzo: Dev Green Hoodie cap
      chibi.circle(0, -11.5, 7); // Bigger hood
      chibi.stroke({ color: 0x10b981, width: 2 });
      chibi.circle(-7, -8, 1);
      chibi.circle(7, -8, 1);
      chibi.fill({ color: 0x10b981 });
    } else if (agent.id === "5") { // Carla: Analyst Black Hair + Glasses
      chibi.arc(0, -12, 6.5, Math.PI, 0);
      chibi.fill({ color: 0x111827 });
      // Glasses frames
      chibi.rect(-4, -13, 3, 2.5);
      chibi.rect(1, -13, 3, 2.5);
      chibi.stroke({ color: 0xef4444, width: 1 });
      chibi.moveTo(-1, -12);
      chibi.lineTo(1, -12);
      chibi.stroke({ color: 0xef4444, width: 1 });
    } else if (agent.id === "6") { // Rodrigo: Finance Brown Hair + Tie
      chibi.arc(0, -12, 6.5, Math.PI, 0);
      chibi.fill({ color: 0x78350f });
      // Tie
      chibi.moveTo(0, -5);
      chibi.lineTo(-1.5, 1);
      chibi.lineTo(0, 3);
      chibi.lineTo(1.5, 1);
      chibi.closePath();
      chibi.fill({ color: 0xef4444 });
    } else if (agent.id === "7") { // Mariana: PM Ponytail
      chibi.arc(0, -12, 6.5, Math.PI, 0);
      chibi.fill({ color: 0x451a03 });
      // Big ponytail on right
      chibi.ellipse(6.5, -9, 3, 6);
      chibi.fill({ color: 0x451a03 });
      chibi.circle(5, -12, 1.5);
      chibi.fill({ color: 0xef4444 }); // red ribbon
    } else if (agent.id === "8") { // Dexter Robot antennae
      chibi.moveTo(-4, -17);
      chibi.lineTo(-4, -22);
      chibi.moveTo(4, -17);
      chibi.lineTo(4, -22);
      chibi.stroke({ color: 0x22d3ee, width: 1.5 });
      chibi.circle(-4, -22, 1.2);
      chibi.circle(4, -22, 1.2);
      chibi.fill({ color: 0x22d3ee });
    }

    chibi.stroke({ color: 0xffffff, width: 0.8, alpha: 0.9 });
    this.core.addChild(chibi);

    // 3. Draw Floating Name Tag (Under the token)
    this.nameTag = new Container();
    this.nameTag.y = 32;
    this.addChild(this.nameTag);

    const labelBg = new Graphics();
    labelBg.roundRect(-45, -8, 90, 16, 4);
    labelBg.fill({ color: 0x0f172a, alpha: 0.85 });
    labelBg.stroke({ color: this.hexStringToNumber(agent.color), width: 1, alpha: 0.7 });
    this.nameTag.addChild(labelBg);

    const nameStyle = new TextStyle({
      fontFamily: "Inter",
      fontSize: 9,
      fontWeight: "600",
      fill: 0xf3f4f6,
      align: "center"
    });
    const labelText = new Text({ text: agent.name.split(" ")[0], style: nameStyle });
    labelText.anchor.set(0.5);
    this.nameTag.addChild(labelText);

    // 4. Speech Bubble Container (Floating above the head)
    this.bubble = new Container();
    this.bubble.y = -42;
    this.bubble.alpha = 0; // Hidden by default
    this.addChild(this.bubble);

    // Speech bubble background
    const bubbleBg = new Graphics();
    bubbleBg.roundRect(-50, -18, 100, 28, 6);
    bubbleBg.fill({ color: 0x0f172a, alpha: 0.95 });
    bubbleBg.stroke({ color: 0x3b82f6, width: 1.5, alpha: 0.9 });
    // Triangle Pointer
    bubbleBg.moveTo(-5, 10);
    bubbleBg.lineTo(0, 15);
    bubbleBg.lineTo(5, 10);
    bubbleBg.fill({ color: 0x0f172a });
    bubbleBg.stroke({ color: 0x3b82f6, width: 1.5, alpha: 0.9 });
    this.bubble.addChild(bubbleBg);

    // Speech bubble text
    const bubbleStyle = new TextStyle({
      fontFamily: "Inter",
      fontSize: 9,
      fill: 0x60a5fa,
      align: "center",
      wordWrap: true,
      wordWrapWidth: 90
    });
    this.bubbleText = new Text({ text: "...", style: bubbleStyle });
    this.bubbleText.anchor.set(0.5, 0.4);
    this.bubble.addChild(this.bubbleText);

    // Set up hover states
    this.on("pointerover", () => {
      this.core.scale.set(1.15);
      this.nameTag.scale.set(1.05);
    });

    this.on("pointerout", () => {
      this.core.scale.set(1.0);
      this.nameTag.scale.set(1.0);
    });

    this.redrawStatusRing();
  }

  // Convert Hex string (e.g. #3b82f6) to number (e.g. 0x3b82f6)
  private hexStringToNumber(hex: string): number {
    return parseInt(hex.replace("#", ""), 16);
  }

  // Redraws the outer status ring
  public redrawStatusRing() {
    this.ring.clear();
    const statusColor = this.statusColors[this.agentData.status];
    
    // Draw status glowing ring
    this.ring.circle(0, 0, 24);
    this.ring.stroke({
      color: statusColor,
      width: 2.5,
      alpha: this.agentData.status === "offline" ? 0.3 : 0.8
    });

    // Add extra tech elements for thinking/chatting states
    if (this.agentData.status === "thinking" || this.agentData.status === "chatting") {
      this.ring.circle(0, 0, 28);
      this.ring.stroke({
        color: statusColor,
        width: 1,
        alpha: 0.4
      });
    }
  }

  // Update loop called by PixiJS Ticker
  public update(delta: number, onReachTarget: (agentId: string) => void) {
    this.pulseTime += delta * 0.05;

    // 1. Pulsing ring animation
    const scaleFactor = Math.sin(this.pulseTime) * 0.08 + 1.0;
    this.ring.scale.set(scaleFactor);
    
    // Rotate ring slightly if thinking
    if (this.agentData.status === "thinking") {
      this.ring.rotation += delta * 0.02;
    } else {
      this.ring.rotation = 0;
    }

    // 2. Handle walking/movement simulation
    const target = this.agentData.targetPosition;
    if (target) {
      this.walkTime += delta * 0.25;

      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const speed = 2.2 * delta; // Movement speed

      if (dist <= speed) {
        // Arrived at destination
        this.x = target.x;
        this.y = target.y;
        this.agentData.position = { x: target.x, y: target.y };
        this.agentData.targetPosition = null;
        this.core.y = 0; // Reset bounce
        onReachTarget(this.agentData.id);
      } else {
        // Move towards target
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;
        this.x += vx;
        this.y += vy;
        this.agentData.position = { x: this.x, y: this.y };

        // Cute walking bounce animation
        this.core.y = -Math.abs(Math.sin(this.walkTime) * 6);
      }
    } else {
      // Bouncing idle animation (subtle)
      this.core.y = Math.sin(this.pulseTime * 0.5) * 1.5;
    }

    // 3. Dynamic Speech Bubble
    const showBubble = 
      this.agentData.status === "chatting" || 
      this.agentData.status === "thinking";

    if (showBubble) {
      this.bubble.alpha = 1;
      if (this.agentData.status === "thinking") {
        this.bubbleText.text = "...";
      } else {
        // Show last user/agent dialogue snippet
        const history = this.agentData.chatHistory;
        if (history.length > 0) {
          const lastMsg = history[history.length - 1].text;
          const truncated = lastMsg.length > 15 ? lastMsg.substring(0, 12) + "..." : lastMsg;
          this.bubbleText.text = truncated;
        } else {
          this.bubbleText.text = "Fala!";
        }
      }
    } else {
      // Fade bubble out
      if (this.bubble.alpha > 0) {
        this.bubble.alpha -= 0.1 * delta;
        if (this.bubble.alpha < 0) this.bubble.alpha = 0;
      }
    }
  }

  // Update data and refresh visual styles
  public updateAgentData(newData: VirtualAgent) {
    const oldStatus = this.agentData.status;
    this.agentData = newData;

    if (oldStatus !== newData.status) {
      this.redrawStatusRing();
    }
  }
}

export function setupAgents(
  stage: Container,
  agentsList: VirtualAgent[],
  onAgentClick: (agentId: string) => void
): Record<string, AgentToken> {
  const agentsContainer = new Container();
  stage.addChild(agentsContainer);

  const tokens: Record<string, AgentToken> = {};

  agentsList.forEach((agent) => {
    const token = new AgentToken(agent, () => onAgentClick(agent.id));
    agentsContainer.addChild(token);
    tokens[agent.id] = token;
  });

  return tokens;
}
