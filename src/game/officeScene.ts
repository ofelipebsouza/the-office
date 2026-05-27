import { Container, Graphics, Text, TextStyle } from "pixi.js";
import type { RoomId } from "../types/agent";

export interface RoomHotspot {
  id: RoomId;
  graphics: Graphics;
  label: Container;
}

// ─── ISO Math ─────────────────────────────────────────────────────────────────
export const TILE_W = 64;
export const TILE_H = 32;

export function isoToScreen(col: number, row: number, ox: number, oy: number) {
  return { x: ox + (col - row) * TILE_W, y: oy + (col + row) * TILE_H };
}

export function getRoomScreenCenter(
  startCol: number, startRow: number,
  cols: number, rows: number,
  viewWidth: number
) {
  const ox = viewWidth / 2 - (8 - 4) * TILE_W / 2;
  const oy = 40;
  const c = isoToScreen(startCol + cols / 2, startRow + rows / 2, ox, oy);
  return { x: c.x, y: c.y + TILE_H };
}

// ─── Floor tile drawing (Subtle blueprint grids) ──────────────────────────────
function drawTile(
  g: Graphics, col: number, row: number, ox: number, oy: number,
  color: number, alpha = 1, sc?: number, sa = 0.2, sw = 0.5
) {
  const c = isoToScreen(col, row, ox, oy);
  const pts = [
    c.x, c.y, 
    c.x + TILE_W, c.y + TILE_H, 
    c.x, c.y + TILE_H * 2, 
    c.x - TILE_W, c.y + TILE_H
  ];
  g.poly(pts); 
  g.fill({ color, alpha });
  if (sc !== undefined) { 
    g.poly(pts); 
    g.stroke({ color: sc, width: sw, alpha: sa }); 
  }
}

// ─── Room layout definitions ──────────────────────────────────────────────────
interface RoomDef {
  id: RoomId; 
  name: string; 
  color: number;
  cols: number; 
  rows: number; 
  startCol: number; 
  startRow: number;
}

const ROOMS: RoomDef[] = [
  { id: "recepcao",  name: "Recepção / CS",    color: 0x3b82f6, cols: 5, rows: 4, startCol: 0,  startRow: 0 },
  { id: "operacao",  name: "Operação Central",  color: 0xa855f7, cols: 7, rows: 5, startCol: 5,  startRow: 0 },
  { id: "diretoria", name: "Diretoria",         color: 0xec4899, cols: 4, rows: 4, startCol: 12, startRow: 0 },
  { id: "reuniao",   name: "Sala de Reunião",   color: 0x06b6d4, cols: 4, rows: 3, startCol: 5,  startRow: 5 },
  { id: "lounge",    name: "Lounge & Café",     color: 0x6366f1, cols: 3, rows: 3, startCol: 9,  startRow: 5 },
];

// ─── Main export ──────────────────────────────────────────────────────────────
export async function setupOfficeScene(
  stage: Container,
  viewWidth: number,
  viewHeight: number,
  onRoomClick: (roomId: RoomId) => void
) {
  const sceneContainer = new Container();
  stage.addChild(sceneContainer);

  const ox = viewWidth / 2 - (8 - 4) * TILE_W / 2;
  const oy = 40;
  const allCols = 16, allRows = 8;

  // ─ 1. Deep background ───────────────────────────────────────────────────────
  const bgG = new Graphics();
  sceneContainer.addChild(bgG);
  bgG.rect(0, 0, viewWidth, viewHeight);
  bgG.fill({ color: 0x050810 });

  // ─ 2. Subtle Blueprint Grid Lines (Architectural Aesthetic) ─────────────────
  const gridG = new Graphics();
  sceneContainer.addChild(gridG);
  
  // Draw light technical grid for the whole floor plate
  for (let col = 0; col <= allCols; col++) {
    const start = isoToScreen(col, 0, ox, oy);
    const end = isoToScreen(col, allRows, ox, oy);
    gridG.moveTo(start.x, start.y);
    gridG.lineTo(end.x, end.y);
    gridG.stroke({ color: 0x1e293b, width: 0.8, alpha: 0.15 });
  }
  for (let row = 0; row <= allRows; row++) {
    const start = isoToScreen(0, row, ox, oy);
    const end = isoToScreen(allCols, row, ox, oy);
    gridG.moveTo(start.x, start.y);
    gridG.lineTo(end.x, end.y);
    gridG.stroke({ color: 0x1e293b, width: 0.8, alpha: 0.15 });
  }

  // ─ 3. Corridor / Base floor plate ───────────────────────────────────────────
  const baseG = new Graphics();
  sceneContainer.addChild(baseG);
  for (let col = 0; col < allCols; col++) {
    for (let r = 0; r < allRows; r++) {
      const inRoom = ROOMS.some(rm => col >= rm.startCol && col < rm.startCol + rm.cols && r >= rm.startRow && r < rm.startRow + rm.rows);
      if (!inRoom) {
        // Draw very light tiles for corridors
        drawTile(baseG, col, r, ox, oy, 0x080c14, 0.4, 0x1e293b, 0.1, 0.5);
      }
    }
  }

  // ─ 4. Room Demarcations ─────────────────────────────────────────────────────
  const hotspots: Record<RoomId, RoomHotspot> = {} as Record<RoomId, RoomHotspot>;

  for (const room of ROOMS) {
    const roomC = new Container();
    sceneContainer.addChild(roomC);

    const fG   = new Graphics(); // floor area
    const borderG = new Graphics(); // solid border demarcation
    const ovG  = new Graphics(); // hover overlay
    roomC.addChild(fG, borderG, ovG);

    // Calculate room coordinates
    const A = isoToScreen(room.startCol, room.startRow, ox, oy);
    const B = isoToScreen(room.startCol + room.cols, room.startRow, ox, oy);
    const C = isoToScreen(room.startCol + room.cols, room.startRow + room.rows, ox, oy);
    const D = isoToScreen(room.startCol, room.startRow + room.rows, ox, oy);
    const fp = [
      A.x, A.y, 
      B.x + TILE_W, B.y + TILE_H, 
      C.x, C.y + TILE_H * 2, 
      D.x - TILE_W, D.y + TILE_H
    ];

    // ── Floor Fill Area ──
    fG.poly(fp);
    fG.fill({ color: room.color, alpha: 0.04 });

    // ── Draw blueprint floor tiles inside the room ──
    for (let col = 0; col < room.cols; col++) {
      for (let r = 0; r < room.rows; r++) {
        drawTile(fG, room.startCol + col, room.startRow + r, ox, oy, room.color, 0.015, room.color, 0.08, 0.4);
      }
    }

    // ── Solid Demarcation Outlines ──
    borderG.poly(fp);
    borderG.stroke({ color: room.color, width: 2, alpha: 0.45 });
    


    // ── Hover Overlay effect ──
    const drawHover = (on: boolean) => {
      ovG.clear();
      if (!on) return;
      ovG.poly(fp); 
      ovG.fill({ color: room.color, alpha: 0.1 });
      ovG.poly(fp);
      ovG.stroke({ color: room.color, width: 3.5, alpha: 0.95 });
    };

    // ── Hit Area ──
    const hitG = new Graphics();
    roomC.addChild(hitG);
    hitG.poly(fp); 
    hitG.fill({ color: room.color, alpha: 0.001 });
    hitG.interactive = true; 
    hitG.cursor = "pointer";

    // ── Label ──
    const cF = isoToScreen(room.startCol + room.cols / 2, room.startRow + room.rows / 2, ox, oy);
    const labelC = new Container();
    labelC.x = cF.x; 
    labelC.y = cF.y + TILE_H;
    labelC.alpha = 0.72;
    roomC.addChild(labelC);

    const lbg = new Graphics();
    lbg.roundRect(-66, -15, 132, 28, 8);
    lbg.fill({ color: 0x050810, alpha: 0.94 });
    lbg.stroke({ color: room.color, width: 1.4, alpha: 0.85 });
    labelC.addChild(lbg);

    // Inner accent line inside label
    const lacc = new Graphics();
    lacc.roundRect(-64, -13, 128, 4, 4); 
    lacc.fill({ color: room.color, alpha: 0.3 });
    labelC.addChild(lacc);

    const ltxt = new Text({
      text: room.name.toUpperCase(),
      style: new TextStyle({ 
        fontFamily: "Outfit, Inter, sans-serif", 
        fontSize: 11, 
        fill: 0xffffff, 
        fontWeight: "700", 
        align: "center", 
        letterSpacing: 1 
      })
    });
    ltxt.anchor.set(0.5);
    labelC.addChild(ltxt);

    hitG.on("pointerover",  () => { drawHover(true);  labelC.alpha = 1; });
    hitG.on("pointerout",   () => { drawHover(false); labelC.alpha = 0.72; });
    hitG.on("pointerdown",  () => { onRoomClick(room.id); });

    hotspots[room.id] = { id: room.id, graphics: hitG, label: labelC };
  }

  return { sceneContainer, bgSprite: bgG, hotspots };
}
