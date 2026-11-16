// All portfolio facts live here. Edit this file to update the site.
export const portfolio = {
  name: "Afsal VT",
  shortName: "Afsal VT",
  role: "Entry-Level SOC Analyst | IT Support Associate",
  tagline:
    "Motivated BCA graduate safeguarding digital environments with Wazuh & Splunk SIEM log monitoring, threat detection, digital forensics, and enterprise IT support.",
  summary:
    "Motivated BCA graduate with hands-on experience in IT support, software troubleshooting, ticket handling, and system monitoring through academic projects and internships. Experienced in SIEM log monitoring, threat detection, and incident detection using Wazuh and Splunk.",
  location: "Kerala, India",
  phone: "+91 83019 78502",
  resume: "/Afsal-VT-Resume.pdf",
  portrait: "/afsal-closeup.webp",
  fullPhoto: "/afsal-portrait.jpg",
  contact: {
    email: "afsalvthoufeek@gmail.com",
    phone: "+91 83019 78502",
    linkedin: "https://linkedin.com/in/afsalthoufeek",
  },
  stats: [
    { value: 4, decimals: 0, suffix: "+", label: "Security Certifications" },
    { value: 2, decimals: 0, suffix: "", label: "SIEM Platforms (Wazuh & Splunk)" },
    { value: 3, decimals: 0, suffix: "+", label: "Internships & Security Labs" },
    { value: 24, decimals: 0, suffix: "/7", label: "Incident Readiness" },
  ],
  skills: [
    {
      name: "Security & Monitoring",
      potion: "Elixir of Vigilance",
      color: "#ff8fc7",
      items: ["SIEM", "Log Collection", "Log Analysis", "Threat Detection", "Incident Detection", "Wazuh", "Splunk", "Nmap", "Burp Suite", "Metasploit"],
    },
    {
      name: "IT Support",
      potion: "Draught of Operations",
      color: "#7fe7ff",
      items: ["Managing Tickets", "Ticket Handling", "Troubleshooting", "Hardware & Software Support", "Windows", "Ubuntu (Linux)", "Networking Fundamentals"],
    },
    {
      name: "Digital Forensics",
      potion: "Tonic of Investigation",
      color: "#b49bff",
      items: ["Data Recovery", "Malware Detection", "Android Bridging", "Digital Investigation"],
    },
    {
      name: "Programming Languages",
      potion: "Potion of Syntax",
      color: "#7dffb5",
      items: ["C Language", "Python", "HTML", "CSS"],
    },
    {
      name: "Soft Skills",
      potion: "Brew of Mastery",
      color: "#ffc56b",
      items: ["Communication", "Teamwork", "Time Management", "Work Ethic", "Adaptability"],
    },
    {
      name: "Languages",
      potion: "Essence of Speech",
      color: "#8fb8ff",
      items: ["English", "Malayalam"],
    },
  ],
  projects: [
    {
      numeral: "I",
      title: "Log Monitoring & Threat Analysis",
      kicker: "RedTeam Hacker Academy · 2025",
      art: "shield" as const,
      summary:
        "Deployed Wazuh SIEM on Ubuntu and Windows hosts for centralized log collection, correlation, and real-time threat detection. Created correlation rules and dashboards to identify brute-force attacks and suspicious PowerShell activity.",
      tech: ["Wazuh SIEM", "Splunk", "Ubuntu (Linux)", "Windows", "Log Collection", "Log Correlation", "Brute-Force Detection", "PowerShell Analysis"],
      url: "https://linkedin.com/in/afsalthoufeek",
    },
    {
      numeral: "II",
      title: "Digital Forensics & Investigation",
      kicker: "Nirmala College of Arts and Science · 2024–2025",
      art: "heatmap" as const,
      summary:
        "Worked on forensic data recovery from pen drives, malware detection, and Android Bridging. Gained practical experience in digital investigation, data analysis, and cybersecurity techniques.",
      tech: ["Data Recovery", "Malware Detection", "Android Bridging", "Digital Investigation", "Data Analysis", "Cybersecurity"],
      url: "https://linkedin.com/in/afsalthoufeek",
    },
    {
      numeral: "III",
      title: "Server Administration & Python Projects",
      kicker: "HashRoot (2026–Present) & Quest Innovative Solutions (2024)",
      art: "closet" as const,
      summary:
        "Server Administrator Intern at HashRoot (Infopark Phase 1, Kochi) managing tickets, Windows/Linux servers, and IT support, paired with hands-on Python industry internship experience at Quest Innovative Solutions.",
      tech: ["Server Administration", "Ticket Handling", "Troubleshooting", "Windows", "Ubuntu (Linux)", "Python", "Networking Fundamentals"],
      url: "https://linkedin.com/in/afsalthoufeek",
    },
  ],
  achievements: [
    {
      title: "4+ Security Certifications",
      detail: "Certified across SOC Analysis, Splunk, and Critical Infrastructure Protection.",
      bars: [
        { label: "EC-Council CSA", value: 100 },
        { label: "ICT Academy CSA", value: 100 },
        { label: "Splunk & OPSWAT ICIP", value: 100 },
      ],
      icon: "scroll" as const,
    },
    { title: "Certified SOC Analyst", detail: "EC-Council (2025–2026) & ICT Academy Kerala (2022–2025).", icon: "crown" as const },
    { title: "Critical Infrastructure Protection", detail: "OPSWAT Academy ICIP (2026–2027) & Intro to Splunk (2026).", icon: "trophy" as const },
  ],
  certifications: [
    { name: "Certified SOC Analyst (CSA) · EC-Council (2025–2026)", issuer: "EC-Council" },
    { name: "Cyber Security Analyst (CSA) · ICT Academy Kerala (2022–2025)", issuer: "ICT Academy Kerala" },
    { name: "Intro to Splunk (E-Learning) · Splunk (2026)", issuer: "Splunk" },
    { name: "Introduction to Critical Infrastructure Protection (ICIP) · OPSWAT Academy (2026–2027)", issuer: "OPSWAT Academy" },
  ],
  timeline: [
    {
      period: "Oct 5, 2026 – Present",
      title: "Server Administrator Intern",
      place: "HashRoot, Infopark Phase 1, Kochi, Kerala",
      detail: "Server administration, ticket handling, troubleshooting, and system monitoring.",
      badge: "Current",
    },
    {
      period: "2022 – 2025",
      title: "Bachelor's Degree in Computer Application (BCA)",
      place: "Nirmala College of Arts and Science, Thrissur, Kerala",
      detail: "Digital Forensics & Cybersecurity Projects",
      badge: "BCA Graduate",
    },
    {
      period: "2020 – 2022",
      title: "Higher Secondary Education",
      place: "St. Thomas Higher Secondary School, Thrissur",
      detail: "Higher Secondary Schooling",
      badge: "Thrissur",
    },
  ],
};

export const chapters = [
  { id: "home", label: "Prologue" },
  { id: "about", label: "The Analyst" },
  { id: "skills", label: "Workshop" },
  { id: "projects", label: "Lantern Village" },
  { id: "treasury", label: "Treasure Hall" },
  { id: "library", label: "Royal Library" },
  { id: "contact", label: "Post Tower" },
];
