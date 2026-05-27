import { Application } from "pixi.js";

export interface PixiAppInstance {
  app: Application;
  destroy: () => void;
}

export async function initPixiApp(container: HTMLDivElement): Promise<PixiAppInstance> {
  const app = new Application();
  
  await app.init({
    width: 1200,
    height: 675,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true,
    backgroundAlpha: 0, // Make transparent so Index.css background shows through
  });

  // PixiJS v8 uses app.canvas instead of app.view
  const canvas = app.canvas;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  
  container.appendChild(canvas);

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      app.renderer.resize(width, height);
    }
  });

  resizeObserver.observe(container);

  return {
    app,
    destroy: () => {
      resizeObserver.disconnect();
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
      app.destroy(true, { children: true, texture: true, style: true });
    }
  };
}
