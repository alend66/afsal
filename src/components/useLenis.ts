import { useEffect, useRef } from "react";
import Lenis from "lenis";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

/** Smooth, cinematic scrolling on desktop (native compositor touch inertia on Android/iOS). */
export function useLenis(enabled: boolean) {
  const ref = useRef<Lenis | null>(null);
  useEffect(() => {
    if (!enabled || prefersReducedMotion() || isTouchDevice()) return;
    const lenis = new Lenis({ duration: 1.25, smoothWheel: true, wheelMultiplier: 0.9 });
    ref.current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      ref.current = null;
    };
  }, [enabled]);
  return ref;
}
