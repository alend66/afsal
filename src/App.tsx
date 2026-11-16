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

// 6 Harry Potter Wizarding World Keyframes Starring Afsal VT (with desktop & mobile portrait focal points)
const HP_SCENES = [
  { url: "/hp/scene1.jpg", start: 0.0, end: 0.115, zoom: [1.0, 1.12] as [number, number], panX: [0, 0] as [number, number], panY: [0, -15] as [number, number], alignBottom: false, mobileFocusX: 0.5, mobilePanY: -0.04, isHeroPortrait: false },
  { url: "/hp/scene2.jpg", start: 0.115, end: 0.27, zoom: [1.0, 1.02] as [number, number], panX: [0, 0] as [number, number], panY: [0, 0] as [number, number], alignBottom: false, mobileFocusX: 0.79, mobilePanY: -0.14, isHeroPortrait: true },
  { url: "/hp/scene3.jpg", start: 0.27, end: 0.4, zoom: [1.0, 1.12] as [number, number], panX: [-12, 12] as [number, number], panY: [0, -8] as [number, number], alignBottom: false, mobileFocusX: 0.5, mobilePanY: -0.08, isHeroPortrait: false },
  { url: "/hp/scene4.jpg", start: 0.4, end: 0.605, zoom: [1.0, 1.15] as [number, number], panX: [10, -10] as [number, number], panY: [0, -12] as [number, number], alignBottom: false, mobileFocusX: 0.5, mobilePanY: -0.04, isHeroPortrait: false },
  { url: "/hp/scene5.jpg", start: 0.605, end: 0.86, zoom: [1.02, 1.15] as [number, number], panX: [-15, 10] as [number, number], panY: [0, -10] as [number, number], alignBottom: false, mobileFocusX: 0.71, mobilePanY: -0.12, isHeroPortrait: false },
  { url: "/hp/scene6.jpg", start: 0.86, end: 1.0, zoom: [1.0, 1.08] as [number, number], panX: [0, 0] as [number, number], panY: [6, -6] as [number, number], alignBottom: false, mobileFocusX: 0.38, mobilePanY: -0.12, isHeroPortrait: false },
];

type Ember = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
  spriteIdx: number;
};

function createEmberSprite(color: string): HTMLCanvasElement {
  const size = 28;
  const off = document.createElement("canvas");
  off.width = size;
  off.height = size;
  const octx = off.getContext("2d");
  if (octx) {
    const c = size / 2;
    const grad = octx.createRadialGradient(c, c, 0, c, c, c);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.28, color);
    grad.addColorStop(0.65, `${color}55`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    octx.fillStyle = grad;
    octx.fillRect(0, 0, size, size);
  }
  return off;
}

export default function App() {
  useLenis(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pos = useRef(0);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(HP_SCENES.length).fill(null));
  const embersRef = useRef<Ember[]>([]);
  const spritesRef = useRef<HTMLCanvasElement[]>([]);
  const gradientsRef = useRef<{ h: number; sceneGrad: CanvasGradient | null; portraitGrad: CanvasGradient | null; portraitGradTop: number }>({
    h: 0,
    sceneGrad: null,
    portraitGrad: null,
    portraitGradTop: 0,
  });

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
    // Pre-render glowing Hogwarts spell ember sprites once (eliminates expensive per-frame shadowBlur on phones)
    const colors = ["#ffdf8e", "#f6c467", "#fff5d6", "#7fe7ff", "#ffd27d"];
    spritesRef.current = colors.map(createEmberSprite);

    const mobile = typeof window !== "undefined" && window.innerWidth < 768;
    const count = mobile ? 24 : 50;
    embersRef.current = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 9 + Math.random() * 14,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: -0.0003 - Math.random() * 0.0005,
      alpha: 0.35 + Math.random() * 0.65,
      phase: Math.random() * Math.PI * 2,
      spriteIdx: Math.floor(Math.random() * colors.length),
    }));

    // Load & pre-decode all 6 Harry Potter scenes starring Afsal so transitions never hitch on mobile
    HP_SCENES.forEach((sc, idx) => {
      const img = new Image();
      img.decoding = "async";
      img.src = `${sc.url}?v=courtyard15`;
      img.onload = () => {
        if (typeof img.decode === "function") {
          img.decode().catch(() => {}).finally(() => {
            imagesRef.current[idx] = img;
          });
        } else {
          imagesRef.current[idx] = img;
        }
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
      const isPortraitMobile = c.width < c.height * 0.88;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (isPortraitMobile && sceneCfg.isHeroPortrait) {
        // On Android & iOS portrait screens for Scene 2 (About Afsal):
        // 1) Draw the starry Hogwarts Courtyard across the full screen height as the ambient background
        const bgScale = Math.max(c.width / img.width, c.height / img.height);
        const bgW = img.width * bgScale;
        const bgH = img.height * bgScale;
        const bgX = -bgW * 0.22; // show the glowing courtyard towers & arches on the left/center
        const bgY = (c.height - bgH) / 2;
        ctx.drawImage(img, bgX, bgY, bgW, bgH);

        // 2) Frame Afsal + the Full Moon + Hogwarts Towers (the right 43% of scene2.jpg) so 100% of Afsal's
        //    shoulders, Gryffindor crest, glowing wand, head, and Moon fit inside the phone width in the top 66% of the screen!
        const portraitSliceRatio = 0.435; // right 43.5% of 1920x900 contains Afsal (x=1085..1920)
        const mobileScale = (c.width / (img.width * portraitSliceRatio)) * (0.98 + 0.03 * clampedT);
        const pw = img.width * mobileScale;
        const ph = img.height * mobileScale;
        const px = c.width - pw; // anchor right edge so Afsal is centered horizontally on the phone screen
        const py = Math.max(0, c.height * 0.02); // sit near the top of the phone screen above the About Afsal card

        ctx.drawImage(img, px, py, pw, ph);

        // 3) Cached smooth dark atmospheric gradient below Afsal so mobile card reads clearly
        const gradTop = Math.max(c.height * 0.48, py + ph * 0.78);
        if (!gradientsRef.current.portraitGrad || gradientsRef.current.h !== c.height || Math.abs(gradientsRef.current.portraitGradTop - gradTop) > 4) {
          const grad = ctx.createLinearGradient(0, gradTop, 0, c.height);
          grad.addColorStop(0, "rgba(8, 10, 36, 0)");
          grad.addColorStop(0.28, "rgba(8, 10, 36, 0.82)");
          grad.addColorStop(1, "rgba(8, 10, 36, 0.96)");
          gradientsRef.current.portraitGrad = grad;
          gradientsRef.current.portraitGradTop = gradTop;
          gradientsRef.current.h = c.height;
        }
        ctx.fillStyle = gradientsRef.current.portraitGrad;
        ctx.fillRect(0, gradTop, c.width, c.height - gradTop);
      } else if (isPortraitMobile) {
        // On Android & iOS portrait screens for all other scenes:
        const scale = sceneCfg.zoom[0] + (sceneCfg.zoom[1] - sceneCfg.zoom[0]) * clampedT;
        const panX = (sceneCfg.panX[0] + (sceneCfg.panX[1] - sceneCfg.panX[0]) * clampedT) * 0.45;
        const baseScale = Math.max(c.width / img.width, c.height / img.height);
        const w = img.width * baseScale * scale;
        const h = img.height * baseScale * scale;

        const focusX = sceneCfg.mobileFocusX ?? 0.5;
        let x = c.width * 0.5 - w * focusX + panX;
        x = Math.min(0, Math.max(c.width - w, x));

        const offsetY = (sceneCfg.mobilePanY ?? 0) * c.height;
        const y = (c.height - h) / 2 + offsetY;

        ctx.drawImage(img, x, y, w, h);

        if (!gradientsRef.current.sceneGrad || gradientsRef.current.h !== c.height) {
          const grad = ctx.createLinearGradient(0, c.height * 0.58, 0, c.height);
          grad.addColorStop(0, "rgba(8, 10, 36, 0)");
          grad.addColorStop(0.55, "rgba(8, 10, 36, 0.68)");
          grad.addColorStop(1, "rgba(8, 10, 36, 0.92)");
          gradientsRef.current.sceneGrad = grad;
          gradientsRef.current.h = c.height;
        }
        ctx.fillStyle = gradientsRef.current.sceneGrad;
        ctx.fillRect(0, c.height * 0.58, c.width, c.height * 0.42);
      } else {
        // Desktop / Landscape rendering
        const scale = sceneCfg.zoom[0] + (sceneCfg.zoom[1] - sceneCfg.zoom[0]) * clampedT;
        const panX = sceneCfg.panX[0] + (sceneCfg.panX[1] - sceneCfg.panX[0]) * clampedT;
        const panY = sceneCfg.panY[0] + (sceneCfg.panY[1] - sceneCfg.panY[0]) * clampedT;

        const baseScale = Math.max(c.width / img.width, c.height / img.height);
        const w = img.width * baseScale * scale;
        const h = img.height * baseScale * scale;
        const x = sceneCfg.alignBottom ? c.width - w + panX : (c.width - w) / 2 + panX;
        const y = sceneCfg.alignBottom ? c.height - h + panY : (c.height - h) / 2 + panY;

        ctx.drawImage(img, x, y, w, h);
      }

      ctx.restore();
    };

    const renderLoop = (time: number) => {
      const c = canvas.current;
      const ctx = c?.getContext("2d", { alpha: false });
      if (c && ctx) {
        const p = pos.current;
        ctx.fillStyle = "#080a24";
        ctx.fillRect(0, 0, c.width, c.height);

        const FADE = 0.035;
        let activeIdx = HP_SCENES.findIndex((s) => p >= s.start && p <= s.end);
        if (activeIdx === -1) activeIdx = p <= 0 ? 0 : HP_SCENES.length - 1;

        const currentScene = HP_SCENES[activeIdx];
        const currentImg = imagesRef.current[activeIdx] || imagesRef.current.find(Boolean);
        const span = Math.max(0.001, currentScene.end - currentScene.start);
        const localT = (p - currentScene.start) / span;

        const isMobileCanvas = c.width < c.height * 0.88;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = isMobileCanvas ? "medium" : "high";

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

        const sprites = spritesRef.current;
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
          const sprite = sprites[e.spriteIdx];
          if (sprite) {
            ctx.globalAlpha = e.alpha * twinkle * 0.9;
            ctx.drawImage(sprite, e.x * c.width - e.size * 0.5, e.y * c.height - e.size * 0.5, e.size, e.size);
          }
        }
        ctx.globalAlpha = 1;
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
      const isPhoneWidth = window.innerWidth < 768;
      const dpr = isPhoneWidth ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(window.innerWidth * dpr);
      c.height = Math.round(window.innerHeight * dpr);
      gradientsRef.current.sceneGrad = null;
      gradientsRef.current.portraitGrad = null;
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
