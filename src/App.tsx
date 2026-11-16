import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLenis } from "./components/useLenis";
import { SceneView } from "./components/Scenes";
import { scenes } from "./data/film";

// ---- Dwell: the film slows down while content is fully on screen, so there's time to read ----
const DWELL = 3.2; // how much longer the camera lingers on each scene
const RAMP = 0.016;
const windows = scenes
  .filter((s) => s.kind !== "opening" && s.kind !== "contact")
  .map((s) => [s.at[0] + RAMP, s.at[1] - RAMP] as [number, number]);
const cuts = Array.from(new Set([0, 1, ...windows.flat().map((v) => Math.min(1, Math.max(0, v)))])).sort((a, b) => a - b);
const segs = cuts.slice(0, -1).map((a, i) => {
  const b = cuts[i + 1];
  const mid = (a + b) / 2;
  const w = windows.some(([x, y]) => mid > x && mid < y) ? DWELL : 1;
  return { a, b, w, len: (b - a) * w };
});
const TOTAL = segs.reduce((t, g) => t + g.len, 0);
/** scroll position (0→1) → film position (0→1) */
function toFilm(u: number) {
  let t = Math.min(1, Math.max(0, u)) * TOTAL;
  for (const g of segs) {
    if (t <= g.len) return g.a + t / g.w;
    t -= g.len;
  }
  return 1;
}

// 6 Pure AI-Generated Harry Potter Wizarding World Keyframes Starring Afsal VT
const HP_SCENES = [
  { url: "/hp/scene1.jpg", start: 0.0, end: 0.115, zoom: [1.0, 1.12] as [number, number], panX: [0, 0] as [number, number], panY: [0, -15] as [number, number], alignBottom: false },
  { url: "/hp/scene2.jpg", start: 0.115, end: 0.27, zoom: [1.0, 1.02] as [number, number], panX: [0, 0] as [number, number], panY: [0, 0] as [number, number], alignBottom: false },
  { url: "/hp/scene3.jpg", start: 0.27, end: 0.4, zoom: [1.0, 1.12] as [number, number], panX: [-12, 12] as [number, number], panY: [0, -8] as [number, number], alignBottom: false },
  { url: "/hp/scene4.jpg", start: 0.4, end: 0.605, zoom: [1.0, 1.15] as [number, number], panX: [10, -10] as [number, number], panY: [0, -12] as [number, number], alignBottom: false },
  { url: "/hp/scene5.jpg", start: 0.605, end: 0.86, zoom: [1.02, 1.15] as [number, number], panX: [-15, 10] as [number, number], panY: [0, -10] as [number, number], alignBottom: false },
  { url: "/hp/scene6.jpg", start: 0.86, end: 1.0, zoom: [1.0, 1.08] as [number, number], panX: [0, 0] as [number, number], panY: [6, -6] as [number, number], alignBottom: false },
];

type Ember = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
  color: string;
};

export default function App() {
  useLenis(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pos = useRef(0);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(HP_SCENES.length).fill(null));
  const embersRef = useRef<Ember[]>([]);

  const { scrollYProgress: scrollRaw } = useScroll();
  const scrollYProgress = useTransform(scrollRaw, toFilm);

  const dim = useTransform(scrollYProgress, (v): number => {
    const on = scenes.some(
      (s) =>
        s.kind !== "opening" &&
        s.kind !== "hero" &&
        s.kind !== "starring" &&
        v > s.at[0] + 0.004 &&
        v < (s.kind === "contact" ? 99 : s.at[1]) - 0.004
    );
    return on ? 1 : 0;
  });
  const endShade = useTransform(scrollYProgress, [0.92, 0.97], [0, 1]);
  const hint = useTransform(scrollYProgress, [0, 0.02], [1, 0]);

  useEffect(() => {
    // Initialize floating Hogwarts spell embers
    const colors = ["#ffdf8e", "#f6c467", "#fff5d6", "#7fe7ff", "#ffd27d"];
    embersRef.current = Array.from({ length: 55 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.1 + Math.random() * 2.6,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: -0.0003 - Math.random() * 0.0005,
      alpha: 0.35 + Math.random() * 0.65,
      phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // Load all 6 Harry Potter scenes starring Afsal
    HP_SCENES.forEach((sc, idx) => {
      const img = new Image();
      img.src = `${sc.url}?v=courtyard14`;
      img.onload = () => {
        imagesRef.current[idx] = img;
      };
    });
  }, []);

  useEffect(() => {
    let rafId = 0;

    const drawSceneImage = (
      ctx: CanvasRenderingContext2D,
      c: HTMLCanvasElement,
      img: HTMLImageElement,
      localT: number,
      sceneCfg: (typeof HP_SCENES)[number],
      alpha: number
    ) => {
      const clampedT = Math.min(1, Math.max(0, localT));
      const scale = sceneCfg.zoom[0] + (sceneCfg.zoom[1] - sceneCfg.zoom[0]) * clampedT;
      const panX = sceneCfg.panX[0] + (sceneCfg.panX[1] - sceneCfg.panX[0]) * clampedT;
      const panY = sceneCfg.panY[0] + (sceneCfg.panY[1] - sceneCfg.panY[0]) * clampedT;

      const baseScale = Math.max(c.width / img.width, c.height / img.height);
      const w = img.width * baseScale * scale;
      const h = img.height * baseScale * scale;
      const x = sceneCfg.alignBottom ? c.width - w + panX : (c.width - w) / 2 + panX;
      const y = sceneCfg.alignBottom ? c.height - h + panY : (c.height - h) / 2 + panY;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
    };

    const renderLoop = (time: number) => {
      const c = canvas.current;
      const ctx = c?.getContext("2d");
      if (c && ctx) {
        const p = pos.current;
        ctx.clearRect(0, 0, c.width, c.height);

        const FADE = 0.035;
        let activeIdx = HP_SCENES.findIndex((s) => p >= s.start && p <= s.end);
        if (activeIdx === -1) activeIdx = p <= 0 ? 0 : HP_SCENES.length - 1;

        const currentScene = HP_SCENES[activeIdx];
        const currentImg = imagesRef.current[activeIdx] || imagesRef.current.find(Boolean);
        const span = Math.max(0.001, currentScene.end - currentScene.start);
        const localT = (p - currentScene.start) / span;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        if (currentImg) {
          drawSceneImage(ctx, c, currentImg, localT, currentScene, 1);
        }

        if (activeIdx < HP_SCENES.length - 1) {
          const distToEnd = currentScene.end - p;
          if (distToEnd < FADE && distToEnd >= 0) {
            const nextImg = imagesRef.current[activeIdx + 1];
            if (nextImg) {
              const blend = 1 - distToEnd / FADE;
              const smoothBlend = blend * blend * (3 - 2 * blend);
              drawSceneImage(ctx, c, nextImg, 0, HP_SCENES[activeIdx + 1], smoothBlend);
            }
          }
        }

        for (const e of embersRef.current) {
          e.x += e.vx;
          e.y += e.vy;
          if (e.y < -0.02) {
            e.y = 1.02;
            e.x = Math.random();
          }
          if (e.x < -0.02) e.x = 1.02;
          if (e.x > 1.02) e.x = -0.02;

          const twinkle = 0.55 + 0.45 * Math.sin(time * 0.003 + e.phase);
          const ex = e.x * c.width;
          const ey = e.y * c.height;

          ctx.save();
          ctx.globalAlpha = e.alpha * twinkle * 0.85;
          ctx.fillStyle = e.color;
          ctx.shadowColor = e.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(ex, ey, e.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const resize = () => {
      const c = canvas.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(window.innerWidth * dpr);
      c.height = Math.round(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    pos.current = Math.min(1, Math.max(0, v));
  });

  return (
    <>
      <div className="film" aria-hidden>
        <canvas ref={canvas} className="film-canvas" />
        <div className="film-vignette" />
        <motion.div className="film-dim" style={{ opacity: dim }} />
        <motion.div className="film-end" style={{ opacity: endShade }} />
      </div>

      <div className="stage">
        {scenes.map((s, i) => (
          <SceneView key={i} s={s} p={scrollYProgress} />
        ))}
      </div>

      <motion.div className="film-hint" style={{ opacity: hint }} aria-hidden>
        <i />
      </motion.div>
      <div className="film-progress" aria-hidden>
        <motion.i style={{ scaleX: scrollRaw }} />
      </div>

      <main className="film-track" aria-label="Afsal VT — Wizarding World portfolio film" />
    </>
  );
}
