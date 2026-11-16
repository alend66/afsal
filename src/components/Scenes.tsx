import { motion, MotionValue, useTransform } from "framer-motion";
import { ReactNode } from "react";
import { portfolio } from "../data/portfolio";
import type { Scene } from "../data/film";

const RAMP = 0.016;

/** Whole-scene envelope: drifts in out of focus, settles, then floats past the camera. */
function useEnvelope(p: MotionValue<number>, a: number, b: number, hold = false, travel = 50) {
  const end = hold ? 99 : b;
  const r = 0.008;
  const opacity = useTransform(p, [a, a + r, end - r, end], [0, 1, 1, 0]);
  const blurV = useTransform(p, [a, a + r, end - r, end], [6, 0, 0, 6]);
  const filter = useTransform(blurV, (v) => `blur(${v}px)`);
  const y = useTransform(p, [a, hold ? a + 0.05 : end], [travel, hold ? 0 : -travel]);
  const scale = useTransform(p, [a, a + r, end - r, end], [0.99, 1, 1, 1.02]);
  const pointerEvents = useTransform(p, (v) => (v > a + r * 0.5 && v < end - r * 0.5 ? "auto" : "none"));
  return { opacity, filter, y, scale, pointerEvents };
}

/** A line inside a scene that arrives a beat after the one before it. */
function Beat({ p, a, i, children, className, as = "div" }: { p: MotionValue<number>; a: number; i: number; children: ReactNode; className?: string; as?: "div" | "p" | "h2" | "h3" }) {
  const s = a + 0.002 + i * 0.0015;
  const opacity = useTransform(p, [s, s + 0.006], [0, 1]);
  const y = useTransform(p, [s, s + 0.008], [10, 0]);
  const blurV = useTransform(p, [s, s + 0.006], [3, 0]);
  const filter = useTransform(blurV, (v) => `blur(${v}px)`);
  const M = motion[as];
  return (
    <M className={className} style={{ opacity, y, filter }}>
      {children}
    </M>
  );
}

/** Big chapter title, letters rising out of the light one by one (grouped by word so words never split mid-word). */
function Letters({ text, p, a, span = 0.016, className }: { text: string; p: MotionValue<number>; a: number; span?: number; className?: string }) {
  const total = Math.max(1, text.length);
  const words = text.split(" ");
  let idx = 0;
  return (
    <span className={className} aria-label={text}>
      {words.map((word, wi) => {
        const wordEl = (
          <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {word.split("").map((c, ci) => {
              const charPos = idx++;
              return <Letter key={ci} c={c} p={p} s={a + (charPos / total) * span} />;
            })}
          </span>
        );
        if (wi < words.length - 1) {
          const spacePos = idx++;
          return (
            <span key={wi} style={{ display: "inline" }}>
              {wordEl}
              <Letter c=" " p={p} s={a + (spacePos / total) * span} />
            </span>
          );
        }
        return wordEl;
      })}
    </span>
  );
}
function Letter({ c, p, s }: { c: string; p: MotionValue<number>; s: number }) {
  const opacity = useTransform(p, [s, s + 0.005], [0, 1]);
  const y = useTransform(p, [s, s + 0.007], ["0.25em", "0em"]);
  const blurV = useTransform(p, [s, s + 0.005], [4, 0]);
  const filter = useTransform(blurV, (v) => `blur(${v}px)`);
  return (
    <motion.span aria-hidden className="ltr" style={{ opacity, y, filter }}>
      {c === " " ? "\u00A0" : c}
    </motion.span>
  );
}

const LinkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Skill constellations: words drift through the sky at different depths */
type Word = { t: string; x: number; y: number; size: number; depth: number; label?: boolean };
const S = portfolio.skills;
const clusters: Word[][] = [
  // left side of the frame — Security & SIEM Monitoring + Offensive & Recon
  [
    { t: "Defense Against Dark Arts (SIEM)", x: 6, y: 16, size: 1, depth: 0.6, label: true },
    { t: "Wazuh SIEM", x: 8, y: 26, size: 1.5, depth: 1 },
    { t: "Splunk", x: 23, y: 24, size: 1.4, depth: 0.8 },
    { t: "Threat Detection", x: 11, y: 34, size: 1.25, depth: 1.2 },
    { t: "Log Analysis", x: 26, y: 33, size: 1.05, depth: 0.8 },
    { t: "Incident Detection", x: 6, y: 42, size: 1.0, depth: 0.6 },
    { t: "Counter-Curses & Recon", x: 7, y: 56, size: 1, depth: 0.6, label: true },
    { t: "Nmap", x: 9, y: 66, size: 1.45, depth: 1.1 },
    { t: "Burp Suite", x: 22, y: 61, size: 1.2, depth: 0.7 },
    { t: "Metasploit", x: 16, y: 75, size: 1.25, depth: 0.9 },
    { t: "Log Collection", x: 6, y: 81, size: 0.95, depth: 0.5 },
  ],
  // right side — IT Support & Digital Forensics
  [
    { t: "Ministry IT Operations", x: 68, y: 15, size: 1, depth: 0.6, label: true },
    { t: "Windows", x: 70, y: 25, size: 1.45, depth: 1.1 },
    { t: "Ubuntu (Linux)", x: 84, y: 21, size: 1.25, depth: 0.8 },
    { t: "Ticket Handling", x: 75, y: 33, size: 1.2, depth: 0.9 },
    { t: "Troubleshooting", x: 68, y: 40, size: 1.05, depth: 0.6 },
    { t: "Networking", x: 85, y: 39, size: 1.0, depth: 0.7 },
    { t: "Forensic Divination", x: 70, y: 56, size: 1, depth: 0.6, label: true },
    { t: "Data Recovery", x: 69, y: 66, size: 1.35, depth: 1.1 },
    { t: "Malware Detection", x: 83, y: 62, size: 1.2, depth: 0.8 },
    { t: "Android Bridging", x: 84, y: 73, size: 1.05, depth: 0.6 },
    { t: "Digital Investigation", x: 68, y: 78, size: 1.0, depth: 0.7 },
  ],
  // lower band — Programming & Soft Skills
  [
    { t: "Ancient Runes & Code", x: 8, y: 62, size: 1, depth: 0.6, label: true },
    { t: "Python", x: 9, y: 71, size: 1.45, depth: 1.1 },
    { t: "C Language", x: 22, y: 69, size: 1.15, depth: 0.8 },
    { t: "HTML", x: 15, y: 80, size: 1.05, depth: 0.7 },
    { t: "CSS", x: 27, y: 79, size: 1.0, depth: 0.6 },
    { t: "Hardware Support", x: 10, y: 88, size: 0.95, depth: 0.7 },
    { t: "Auror Virtues", x: 66, y: 62, size: 1, depth: 0.6, label: true },
    { t: "Communication", x: 66, y: 71, size: 1.3, depth: 1.1 },
    { t: "Teamwork", x: 85, y: 69, size: 1.2, depth: 0.9 },
    { t: "Time Management", x: 70, y: 80, size: 1.05, depth: 0.8 },
    { t: "Adaptability", x: 88, y: 79, size: 1.15, depth: 1.0 },
    { t: "Work Ethic", x: 65, y: 88, size: 0.95, depth: 0.6 },
    { t: "English & Malayalam", x: 82, y: 88, size: 0.95, depth: 0.6 },
  ],
];
void S;

const isPhone = typeof window !== "undefined" && window.innerWidth < 760;

function SkillWord({ w: w0, p, a, b, i, n }: { w: Word; p: MotionValue<number>; a: number; b: number; i: number; n: number }) {
  const w = isPhone ? { ...w0, x: w0.label ? 6 : i % 2 ? 58 : 10, y: 12 + (i * 74) / Math.max(1, n - 1), size: w0.label ? w0.size : Math.min(w0.size, 1.2) } : w0;
  const s = a + 0.004 + (i % 7) * 0.003;
  const opacity = useTransform(p, [s, s + 0.012, b - 0.012, b], [0, w.label ? 1 : 0.95, w.label ? 1 : 0.95, 0]);
  const y = useTransform(p, [a, b], [60 * w.depth, -90 * w.depth]);
  const blurV = useTransform(p, [s, s + 0.012, b - 0.012, b], [10, w.depth < 0.6 ? 0.6 : 0, 0, 10]);
  const filter = useTransform(blurV, (v) => `blur(${v}px)`);
  return (
    <motion.span
      className={`sk ${w.label ? "sk-label" : ""}`}
      style={{ left: `${w.x}%`, top: `${w.y}%`, translate: `-${w.x}% 0`, opacity, y, filter, fontSize: `calc(${w.size} * var(--sk))` }}
    >
      {w.label ? (
        <>
          <i /> {w.t}
        </>
      ) : (
        w.t
      )}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
export function SceneView({ s, p }: { s: Scene; p: MotionValue<number> }) {
  const [a, b] = s.at;
  const hold = s.kind === "contact";
  const env = useEnvelope(p, a, b, hold, s.kind === "heading" ? 30 : 50);
  const P = portfolio;

  switch (s.kind) {
    case "opening":
      return (
        <motion.div className="sc sc-center halo" style={env}>
          <p className="t-eyebrow">⚡ A Wizarding World Portfolio Film ⚡</p>
          <p className="t-meta">Starring Afsal VT · Scroll to cast Lumos</p>
        </motion.div>
      );

    case "hero":
      return (
        <motion.div className="sc sc-lower halo" style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="t-eyebrow">Hogwarts School of Cyber Defense</Beat>
          <h1 className="h-hero">
            <Letters text={P.shortName} p={p} a={a} span={0.018} />
          </h1>
        </motion.div>
      );

    case "heading":
      return (
        <motion.div className={`sc sc-${s.pos} halo-soft`} style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="h-eyebrow">✦ {s.eyebrow} ✦</Beat>
          <h2 className="h-chapter">
            <Letters text={s.text} p={p} a={a} />
          </h2>
          <Beat p={p} a={a} i={3} className="h-line"><i /></Beat>
        </motion.div>
      );

    case "about":
      return (
        <motion.div className="sc sc-lm halo comp" style={env}>
          <Beat p={p} a={a - 0.004} i={0} as="p" className="h-eyebrow">✦ Chapter I · The Auror&apos;s Oath ✦</Beat>
          <h2 className="h-section">
            <Letters text="About Afsal" p={p} a={a - 0.003} span={0.004} />
          </h2>
          <Beat p={p} a={a} i={0} as="p" className="comp-lead">
            Entry-Level <b>SOC Analyst</b> &amp; <b>IT Support Associate</b> guarding the realm with <b>Wazuh</b> &amp; <b>Splunk</b> SIEM monitoring, threat detection, digital forensics, and Windows/Linux infrastructure mastery.
          </Beat>
          <Beat p={p} a={a} i={1} className="comp-stats">
            <div><b>4+</b><span>Certifications</span></div>
            <em />
            <div><b>SIEM</b><span>Wazuh &amp; Splunk</span></div>
            <em />
            <div><b>BCA</b><span>Graduate</span></div>
          </Beat>
        </motion.div>
      );

    case "starring":
      return (
        <motion.div className="sc sc-tl halo" style={env}>
          <p className="t-eyebrow">⚡ Main Character · Starring ⚡</p>
          <p className="t-title">{P.name}</p>
          <p className="t-meta" style={{ marginTop: "4px" }}>{P.role}</p>
        </motion.div>
      );

    case "education":
      return (
        <motion.div className="sc sc-rm halo comp right" style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="h-eyebrow">✦ The Great Hall of Learning ✦</Beat>
          <h2 className="h-section">
            <Letters text="Education" p={p} a={a} span={0.012} />
          </h2>
          <Beat p={p} a={a} i={3} className="edu-line">
            <span className="edu-year">2022 — 2025</span>
            <p className="edu-title">Bachelor&apos;s in Computer Application (BCA)</p>
            <p className="edu-place">Nirmala College of Arts and Science, Thrissur, Kerala</p>
            <span className="pill-glass">Computer Applications</span>
          </Beat>
          <Beat p={p} a={a} i={6} className="edu-line">
            <span className="edu-year">2020 — 2022</span>
            <p className="edu-title">Higher Secondary Education</p>
            <p className="edu-place">St. Thomas Higher Secondary School, Thrissur</p>
            <span className="pill-glass">Thrissur, Kerala</span>
          </Beat>
          <Beat p={p} a={a} i={9} as="p" className="edu-honour">✦ Certified SOC Analyst — EC-Council &amp; ICT Academy ✦</Beat>
        </motion.div>
      );

    case "skills":
      return (
        <div className="sc-field">
          {clusters[s.cluster].map((w, i) => (
            <SkillWord key={w.t} w={w} p={p} a={a} b={b} i={i} n={clusters[s.cluster].length} />
          ))}
        </div>
      );

    case "project": {
      const pr = P.projects[s.index];
      return (
        <motion.div className={`sc sc-${s.pos}`} style={env}>
          <Glass p={p} a={a} b={b} wide={s.pos !== "rm"}>
            <Beat p={p} a={a} i={0} as="p" className="g-num">{pr.numeral}</Beat>
            <div className="g-main">
              <Beat p={p} a={a} i={1} as="p" className="g-kicker">{pr.kicker}</Beat>
              <Beat p={p} a={a} i={2} as="h3" className="g-title">{pr.title}</Beat>
              <Beat p={p} a={a} i={3} as="p" className="g-body">{pr.summary}</Beat>
              <Beat p={p} a={a} i={4} className="g-tech">
                {pr.tech.slice(0, 8).join("  ·  ")}
              </Beat>
              <Beat p={p} a={a} i={5}>
                <a className="g-link" href={pr.url} target="_blank" rel="noreferrer">
                  <LinkIcon /> Connect on LinkedIn <span aria-hidden>→</span>
                </a>
              </Beat>
            </div>
          </Glass>
        </motion.div>
      );
    }

    case "achievements":
      return (
        <motion.div className="sc sc-tl-wide halo comp" style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="h-eyebrow">✦ Chapter IV · Order of Merlin ✦</Beat>
          <h2 className="h-section">
            <Letters text="Certifications" p={p} a={a} span={0.014} />
          </h2>
          <Beat p={p} a={a} i={3} className="ach-big">
            <b>4x</b>
            <span>Cybersecurity &amp; SIEM Credentials</span>
          </Beat>
          <Beat p={p} a={a} i={5} as="p" className="ach-meta">EC-Council CSA &nbsp;✦&nbsp; ICT Academy CSA &nbsp;✦&nbsp; Splunk &nbsp;✦&nbsp; OPSWAT ICIP</Beat>
          <Beat p={p} a={a} i={7} as="p" className="ach-line"><span>Certified SOC Analyst (CSA)</span> EC-Council (2025–2026) &amp; ICT Academy Kerala (2022–2025)</Beat>
          <Beat p={p} a={a} i={8} as="p" className="ach-line"><span>Critical Infrastructure (ICIP)</span> OPSWAT Academy (2026–2027) &amp; Intro to Splunk (2026)</Beat>
        </motion.div>
      );

    case "experience":
      return (
        <motion.div className="sc sc-rm halo comp right" style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="h-eyebrow">✦ Chapter V · Auror Missions ✦</Beat>
          <h2 className="h-section">
            <Letters text="Experience" p={p} a={a} span={0.012} />
          </h2>
          <Beat p={p} a={a} i={3} className="edu-line">
            <span className="edu-year">Oct 5, 2026 — Present</span>
            <p className="edu-title">Server Administrator Intern</p>
            <p className="edu-place">HashRoot, Infopark Phase 1, Kochi, Kerala</p>
          </Beat>
          <Beat p={p} a={a} i={5} className="edu-line">
            <span className="edu-year">2025 &amp; May 2024</span>
            <p className="edu-title">SIEM Threat Analysis &amp; Python Internships</p>
            <p className="edu-place">RedTeam Hacker Academy (2025) · Quest Innovative Solutions (2024)</p>
          </Beat>
          <Beat p={p} a={a} i={7} as="p" className="cert-head">Verified Credentials</Beat>
          <Beat p={p} a={a} i={8} as="p" className="cert-roll">
            {P.certifications.map((c) => c.name).join("  ✦  ")}
          </Beat>
        </motion.div>
      );

    case "contact":
      return (
        <motion.div className="sc sc-center halo-strong" style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="h-eyebrow">✦ Epilogue · The Owlery ✦</Beat>
          <h2 className="h-chapter">
            <Letters text="Send an Owl" p={p} a={a} />
          </h2>
          <Beat p={p} a={a} i={4} as="p" className="ct-lead">The next chapter begins with you — open to Entry-Level SOC Analyst, IT Support Associate &amp; Server Administration roles.</Beat>
          <Beat p={p} a={a} i={6}>
            <a className="ct-mail" href={`mailto:${P.contact.email}`}>{P.contact.email}</a>
          </Beat>
          <Beat p={p} a={a} i={8} className="ct-links">
            <a className="pill-glass link" href={`tel:+918301978502`}>{P.contact.phone}</a>
            <a className="pill-glass link" href={P.contact.linkedin} target="_blank" rel="noreferrer"><LinkIcon /> LinkedIn</a>
            <a className="pill-glass link" href={P.resume} target="_blank" rel="noreferrer">Résumé</a>
          </Beat>
          <Beat p={p} a={a} i={10} as="p" className="ct-credit">© 2026 {P.name} · Thrissur / Kochi, Kerala, India · Wizarding World Edition</Beat>
        </motion.div>
      );
  }
}

/** Premium frosted glass: almost invisible edges, a specular sheen that slides as the camera moves. */
function Glass({ p, a, b, wide, children }: { p: MotionValue<number>; a: number; b: number; wide?: boolean; children: ReactNode }) {
  const sheen = useTransform(p, [a, b], ["-60%", "160%"]);
  const tilt = useTransform(p, [a, b], [4, -4]);
  return (
    <motion.div className={`glass ${wide ? "wide" : ""}`} style={{ rotateY: tilt }}>
      <motion.span className="glass-sheen" style={{ x: sheen }} />
      <span className="glass-edge" />
      {children}
    </motion.div>
  );
}
