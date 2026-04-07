import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/7d002939-adba-404b-a65e-e3b258e5bbe3";

const HERO_BG = "https://cdn.poehali.dev/projects/d75e8fe5-d875-42ac-8ebd-004196f18ea0/files/2a885155-bdc6-4856-bb51-3d7c1ed3b7ed.jpg";

const NAV_ITEMS = [
  { id: "home", label: "Главная" },
  { id: "about", label: "О команде" },
  { id: "players", label: "Игроки" },
  { id: "achievements", label: "Достижения" },
  { id: "tournaments", label: "Турниры" },
  { id: "sponsors", label: "Спонсоры" },
  { id: "streams", label: "Трансляции" },
  { id: "contacts", label: "Контакты" },
];

const ACHIEVEMENTS = [
  { year: "2024", title: "Чемпионат Европы", place: "1", prize: "€200,000", game: "CS2" },
  { year: "2024", title: "NEXUS Open Series", place: "1", prize: "€50,000", game: "CS2" },
  { year: "2023", title: "Мировой Финал", place: "2", prize: "$500,000", game: "CS2" },
  { year: "2023", title: "Regional Masters", place: "1", prize: "€75,000", game: "CS2" },
  { year: "2023", title: "IEM Cologne", place: "3", prize: "$30,000", game: "CS2" },
  { year: "2022", title: "ESL Pro League", place: "1", prize: "$200,000", game: "CSGO" },
];

const TOURNAMENTS = [
  { name: "World Cyber Arena 2025", date: "15 MAY 2025", prize: "$1,000,000", status: "upcoming", location: "Москва, Россия", teams: 24 },
  { name: "NEXUS Championship", date: "28 APR 2025", prize: "€250,000", status: "upcoming", location: "Берлин, Германия", teams: 16 },
  { name: "Spring Split 2025", date: "10 MAR 2025", prize: "€100,000", status: "active", location: "Онлайн", teams: 32 },
  { name: "Regional Qualifier", date: "20 FEB 2025", prize: "€25,000", status: "completed", location: "Варшава, Польша", teams: 48 },
];

const SPONSORS = [
  { name: "RAZER", tier: "title", desc: "Игровая периферия" },
  { name: "NVIDIA", tier: "title", desc: "Видеокарты" },
  { name: "ASUS ROG", tier: "gold", desc: "Игровые ПК" },
  { name: "Logitech G", tier: "gold", desc: "Аксессуары" },
  { name: "HyperX", tier: "silver", desc: "Гарнитуры" },
  { name: "SteelSeries", tier: "silver", desc: "Мыши и коврики" },
];

const STREAMS = [
  { platform: "Twitch", channel: "nexusteam_official", viewers: "12.4K", live: true, game: "CS2" },
  { platform: "YouTube", channel: "@NexusTeamGG", viewers: "8.7K", live: true, game: "Разбор матчей" },
  { platform: "ВКонтакте", channel: "nexusteam", viewers: "5.2K", live: false, game: "Тренировки" },
];

interface Player {
  id: number;
  tag: string;
  name: string;
  role: string;
  rank: string;
  rating: number;
  kd: number;
  winrate: number;
  headshots: number;
  stats: { aim: number; reaction: number; strategy: number; teamplay: number };
  color: string;
  photo_url: string | null;
  bio: string | null;
  country: string | null;
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="font-mono text-xs font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}

function Hexagon({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-16 h-16 flex items-center justify-center"
        style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", background: `linear-gradient(135deg, ${color}22, ${color}44)` }}
      >
        <span className="font-orbitron font-bold text-sm" style={{ color }}>{value}</span>
      </div>
      <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function GlitchText({ children, className = "" }: { children: string; className?: string }) {
  const [glitching, setGlitching] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 300);
    }, Math.random() * 5000 + 3000);
    return () => clearInterval(interval);
  }, []);
  return <span className={`${className} ${glitching ? "animate-glitch" : ""} inline-block`}>{children}</span>;
}

function PlayerSkeleton() {
  return (
    <div className="hud-panel rounded p-4 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-800 rounded w-3/4" />
    </div>
  );
}

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data.players);
        if (data.players.length > 0) setSelectedPlayer(data.players[0]);
      })
      .catch(console.error)
      .finally(() => setLoadingPlayers(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.3 }
    );
    Object.values(sectionsRef.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    sectionsRef.current[id]?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const timeStr = time.toLocaleTimeString("ru", { hour12: false });
  const dateStr = time.toLocaleDateString("ru", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#020408] text-white font-rajdhani">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020408]/90 backdrop-blur-md border-b border-cyan-900/30">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <button onClick={() => scrollTo("home")} className="flex items-center gap-2 group">
            <div className="w-8 h-8 border border-[#00f5ff] flex items-center justify-center">
              <span className="font-orbitron font-black text-[#00f5ff] text-xs neon-cyan">NX</span>
            </div>
            <span className="font-orbitron font-bold text-sm tracking-widest hidden sm:block">
              <span className="neon-cyan">NEXUS</span>
              <span className="text-gray-400 ml-1">TEAM</span>
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`px-3 py-1.5 font-rajdhani font-semibold text-xs tracking-widest uppercase transition-all duration-200 relative ${
                  activeSection === item.id ? "text-[#00f5ff]" : "text-gray-400 hover:text-[#00f5ff]"
                }`}
              >
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-[#00f5ff] shadow-[0_0_6px_#00f5ff]" />
                )}
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-mono text-[#00f5ff] text-xs">{timeStr}</span>
              <span className="font-mono text-gray-500 text-[10px]">{dateStr}</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-[#00f5ff] p-1">
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#020408]/95 border-t border-cyan-900/30 py-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`block w-full text-left px-6 py-2.5 font-rajdhani font-semibold text-sm tracking-widest uppercase ${
                  activeSection === item.id ? "text-[#00f5ff]" : "text-gray-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" ref={(el) => (sectionsRef.current["home"] = el)} className="min-h-screen relative flex items-center justify-center overflow-hidden scan-overlay">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020408]/60 via-[#020408]/40 to-[#020408]" />
        <div className="absolute inset-0 grid-bg" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full bg-[#00f5ff]/60"
            style={{ left: `${10 + i * 11}%`, top: `${20 + (i % 3) * 20}%`, animation: `float ${3 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.4}s`, boxShadow: "0 0 6px #00f5ff" }}
          />
        ))}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <div className="font-mono text-[#00f5ff]/60 text-xs tracking-[0.3em] mb-4 uppercase">// SYSTEM.ONLINE — NEXUS_CORE v2.4.1</div>
          <h1 className="font-orbitron font-black leading-none mb-4">
            <GlitchText className="block text-5xl sm:text-7xl lg:text-9xl text-white">NEXUS</GlitchText>
            <span className="block text-3xl sm:text-5xl lg:text-7xl neon-cyan tracking-[0.2em]">TEAM</span>
          </h1>
          <p className="font-rajdhani text-lg sm:text-xl text-gray-300 tracking-widest mb-8 max-w-2xl mx-auto">
            Профессиональная киберспортивная организация.<br />
            <span className="text-[#00f5ff]">Доминируем</span> в соревновательной сцене с 2019 года.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <button onClick={() => scrollTo("players")}
              className="px-8 py-3 font-orbitron font-bold text-sm tracking-widest uppercase text-[#020408]"
              style={{ background: "linear-gradient(90deg, #00f5ff, #00ff88)", clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
              СОСТАВ
            </button>
            <button onClick={() => scrollTo("streams")}
              className="px-8 py-3 font-orbitron font-bold text-sm tracking-widest uppercase border border-[#00f5ff]/50 text-[#00f5ff] hover:bg-[#00f5ff]/10 transition-all"
              style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
              СМОТРЕТЬ LIVE
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 border-t border-[#00f5ff]/10 pt-8">
            {[{ label: "Побед", value: "247" }, { label: "Титулов", value: "18" }, { label: "Призовые", value: "$1.2M" }, { label: "Рейтинг", value: "#3 EU" }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-orbitron font-black text-2xl sm:text-3xl neon-cyan">{s.value}</div>
                <div className="font-mono text-gray-500 text-xs tracking-widest uppercase mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <Icon name="ChevronDown" size={24} className="text-[#00f5ff]/50" />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" ref={(el) => (sectionsRef.current["about"] = el)} className="py-24 relative grid-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-16 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00f5ff]/30" />
            <h2 className="font-orbitron font-bold text-xl sm:text-2xl tracking-widest uppercase text-[#00f5ff]">О КОМАНДЕ</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00f5ff]/30" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="font-mono text-[#00f5ff]/50 text-xs tracking-widest mb-4">// TEAM.BIO</div>
              <h3 className="font-orbitron font-bold text-2xl sm:text-3xl text-white mb-6 leading-tight">
                Мы не просто команда —<br /><span className="neon-cyan">мы система</span>
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                NEXUS TEAM основана в 2019 году с одной целью — завоевать вершины мирового киберспорта.
                За пять лет мы выросли из локальной команды в международную организацию с игроками из 4 стран.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Наш подход основан на аналитике данных, системных тренировках и постоянном совершенствовании.
                Каждый матч — это битва не только навыков, но и стратегии.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[{ icon: "Users", label: "Игроков", val: "12" }, { icon: "Globe", label: "Стран", val: "4" }, { icon: "Trophy", label: "Лет опыта", val: "5+" }, { icon: "Zap", label: "Дисциплин", val: "3" }].map((item) => (
                  <div key={item.label} className="hud-panel corner-deco p-4 rounded">
                    <Icon name={item.icon} size={20} className="text-[#00f5ff] mb-2" />
                    <div className="font-orbitron font-bold text-xl text-white">{item.val}</div>
                    <div className="font-mono text-gray-500 text-xs uppercase tracking-wider">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hud-panel corner-deco rounded p-6">
              <div className="font-mono text-[#00f5ff]/50 text-xs tracking-widest mb-4">// TEAM.STATS_OVERVIEW</div>
              <div className="space-y-4">
                {[
                  { label: "Win Rate", value: 68, color: "#00f5ff" },
                  { label: "Avg Rating", value: 82, color: "#00ff88" },
                  { label: "Headshot %", value: 54, color: "#ff00ff" },
                  { label: "Clutch Rate", value: 71, color: "#ffaa00" },
                  { label: "Map Control", value: 88, color: "#ff4466" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-xs text-gray-400 tracking-wider">{s.label}</span>
                      <span className="font-mono text-xs font-bold" style={{ color: s.color }}>{s.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)`, boxShadow: `0 0 8px ${s.color}` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLAYERS */}
      <section id="players" ref={(el) => (sectionsRef.current["players"] = el)} className="py-24 bg-[#010203] relative">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="mb-16 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ff00ff]/30" />
            <h2 className="font-orbitron font-bold text-xl sm:text-2xl tracking-widest uppercase neon-magenta">СОСТАВ</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ff00ff]/30" />
          </div>

          {loadingPlayers ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">{[...Array(5)].map((_, i) => <PlayerSkeleton key={i} />)}</div>
              <div className="lg:col-span-2 hud-panel rounded p-6 animate-pulse">
                <div className="h-8 bg-gray-800 rounded w-1/2 mb-4" />
                <div className="h-4 bg-gray-800 rounded w-1/3 mb-8" />
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-3 bg-gray-800 rounded" />)}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Player list */}
              <div className="space-y-3">
                {players.map((player) => (
                  <button key={player.id} onClick={() => setSelectedPlayer(player)}
                    className="w-full text-left p-4 rounded transition-all duration-200 border"
                    style={selectedPlayer?.id === player.id
                      ? { borderColor: player.color, backgroundColor: `${player.color}10`, boxShadow: `0 0 20px ${player.color}20` }
                      : { borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(5,13,20,0.5)" }
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-orbitron font-bold text-sm tracking-wider" style={{ color: player.color }}>{player.tag}</div>
                        <div className="font-rajdhani text-gray-400 text-sm">{player.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs text-gray-500">{player.role}</div>
                        <div className="font-orbitron text-xs font-bold text-gray-300">{player.rank}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Player detail */}
              {selectedPlayer && (
                <div className="lg:col-span-2 rounded p-6"
                  style={{ background: `linear-gradient(135deg, ${selectedPlayer.color}08, #020408 60%)`, border: `1px solid ${selectedPlayer.color}30`, boxShadow: `0 0 40px ${selectedPlayer.color}15` }}>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="font-mono text-xs tracking-widest mb-1" style={{ color: selectedPlayer.color }}>// PLAYER.PROFILE</div>
                      <h3 className="font-orbitron font-black text-3xl sm:text-4xl text-white mb-1">{selectedPlayer.tag}</h3>
                      <p className="font-rajdhani text-gray-400 text-lg">{selectedPlayer.name}</p>
                      <p className="font-mono text-xs text-gray-500 mt-1">{selectedPlayer.role}</p>
                    </div>
                    <div className="text-center px-4 py-2 rounded border font-orbitron"
                      style={{ borderColor: selectedPlayer.color, color: selectedPlayer.color, background: `${selectedPlayer.color}10` }}>
                      <div className="text-2xl font-black">{selectedPlayer.rating}</div>
                      <div className="text-xs text-gray-400">{selectedPlayer.rank}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <Hexagon value={`${selectedPlayer.kd}`} label="K/D" color={selectedPlayer.color} />
                    <Hexagon value={`${selectedPlayer.winrate}%`} label="Win Rate" color={selectedPlayer.color} />
                    <Hexagon value={`${selectedPlayer.headshots}%`} label="HS%" color={selectedPlayer.color} />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-gray-500 tracking-widest mb-3">// SKILL_MATRIX</div>
                    <StatBar label="Прицеливание" value={selectedPlayer.stats.aim} color={selectedPlayer.color} />
                    <StatBar label="Реакция" value={selectedPlayer.stats.reaction} color={selectedPlayer.color} />
                    <StatBar label="Стратегия" value={selectedPlayer.stats.strategy} color={selectedPlayer.color} />
                    <StatBar label="Командная игра" value={selectedPlayer.stats.teamplay} color={selectedPlayer.color} />
                  </div>
                  {selectedPlayer.bio && (
                    <p className="mt-4 font-rajdhani text-gray-400 text-sm border-t border-white/5 pt-4">{selectedPlayer.bio}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section id="achievements" ref={(el) => (sectionsRef.current["achievements"] = el)} className="py-24 relative grid-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-16 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ffaa00]/30" />
            <h2 className="font-orbitron font-bold text-xl sm:text-2xl tracking-widest uppercase" style={{ color: "#ffaa00", textShadow: "0 0 20px #ffaa00" }}>ДОСТИЖЕНИЯ</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ffaa00]/30" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((ach, i) => (
              <div key={i} className="hud-panel corner-deco rounded p-5 group transition-all duration-300"
                style={{ borderColor: ach.place === "1" ? "rgba(255,170,0,0.3)" : ach.place === "2" ? "rgba(200,200,220,0.3)" : "rgba(180,120,80,0.3)" }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-xs text-gray-500">{ach.year}</span>
                  <span className="font-orbitron font-black text-2xl"
                    style={{ color: ach.place === "1" ? "#ffaa00" : ach.place === "2" ? "#c0c0dc" : "#cd7f32", textShadow: `0 0 15px ${ach.place === "1" ? "#ffaa00" : ach.place === "2" ? "#c0c0dc" : "#cd7f32"}` }}>
                    #{ach.place}
                  </span>
                </div>
                <h3 className="font-orbitron font-bold text-sm text-white mb-2 group-hover:text-[#00f5ff] transition-colors">{ach.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-500">{ach.game}</span>
                  <span className="font-orbitron text-sm font-bold neon-green">{ach.prize}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOURNAMENTS */}
      <section id="tournaments" ref={(el) => (sectionsRef.current["tournaments"] = el)} className="py-24 bg-[#010203] relative">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="mb-16 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00ff88]/30" />
            <h2 className="font-orbitron font-bold text-xl sm:text-2xl tracking-widest uppercase neon-green">ТУРНИРЫ</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00ff88]/30" />
          </div>
          <div className="space-y-4">
            {TOURNAMENTS.map((t, i) => (
              <div key={i} className="hud-panel corner-deco rounded p-5 sm:p-6 group hover:border-[#00ff88]/30 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${t.status === "active" ? "bg-[#00ff88]" : t.status === "upcoming" ? "bg-[#00f5ff]" : "bg-gray-600"}`}
                      style={t.status === "active" ? { boxShadow: "0 0 10px #00ff88", animation: "pulse-neon 2s ease-in-out infinite" } : {}} />
                    <div>
                      <h3 className="font-orbitron font-bold text-base sm:text-lg text-white group-hover:text-[#00f5ff] transition-colors">{t.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="font-mono text-xs text-gray-500 flex items-center gap-1"><Icon name="Calendar" size={10} />{t.date}</span>
                        <span className="font-mono text-xs text-gray-500 flex items-center gap-1"><Icon name="MapPin" size={10} />{t.location}</span>
                        <span className="font-mono text-xs text-gray-500 flex items-center gap-1"><Icon name="Users" size={10} />{t.teams} команд</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-orbitron font-black text-lg neon-green">{t.prize}</div>
                      <div className="font-mono text-xs text-gray-500">Prize Pool</div>
                    </div>
                    <span className={`font-mono text-xs px-2 py-1 rounded border uppercase tracking-wider ${t.status === "active" ? "border-[#00ff88]/50 text-[#00ff88] bg-[#00ff88]/10" : t.status === "upcoming" ? "border-[#00f5ff]/50 text-[#00f5ff] bg-[#00f5ff]/10" : "border-gray-700 text-gray-500"}`}>
                      {t.status === "active" ? "LIVE" : t.status === "upcoming" ? "SOON" : "DONE"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      <section id="sponsors" ref={(el) => (sectionsRef.current["sponsors"] = el)} className="py-24 relative grid-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-16 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00f5ff]/30" />
            <h2 className="font-orbitron font-bold text-xl sm:text-2xl tracking-widest uppercase text-[#00f5ff]">СПОНСОРЫ</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00f5ff]/30" />
          </div>
          <div className="mb-6">
            <div className="font-mono text-xs text-[#ffaa00]/60 tracking-widest mb-4">// TITLE SPONSORS</div>
            <div className="grid grid-cols-2 gap-4">
              {SPONSORS.filter((s) => s.tier === "title").map((s, i) => (
                <div key={i} className="hud-panel corner-deco rounded p-6 text-center group hover:border-[#ffaa00]/40 transition-all">
                  <div className="font-orbitron font-black text-2xl sm:text-3xl text-white mb-2 group-hover:text-[#ffaa00] transition-colors">{s.name}</div>
                  <div className="font-mono text-xs text-gray-500 uppercase tracking-wider">{s.desc}</div>
                  <div className="mt-3 inline-block px-2 py-0.5 border border-[#ffaa00]/40 text-[#ffaa00] font-mono text-xs">TITLE</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <div className="font-mono text-xs text-[#00f5ff]/60 tracking-widest mb-4">// GOLD SPONSORS</div>
            <div className="grid grid-cols-2 gap-4">
              {SPONSORS.filter((s) => s.tier === "gold").map((s, i) => (
                <div key={i} className="hud-panel rounded p-5 text-center group hover:border-[#00f5ff]/30 transition-all">
                  <div className="font-orbitron font-bold text-xl text-white mb-1 group-hover:text-[#00f5ff] transition-colors">{s.name}</div>
                  <div className="font-mono text-xs text-gray-500">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-gray-500/60 tracking-widest mb-4">// SILVER SPONSORS</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SPONSORS.filter((s) => s.tier === "silver").map((s, i) => (
                <div key={i} className="border border-gray-800 rounded p-4 text-center hover:border-gray-600 transition-all">
                  <div className="font-orbitron font-bold text-sm text-gray-400 mb-1">{s.name}</div>
                  <div className="font-mono text-xs text-gray-600">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STREAMS */}
      <section id="streams" ref={(el) => (sectionsRef.current["streams"] = el)} className="py-24 bg-[#010203] relative">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="mb-16 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ff4466]/30" />
            <h2 className="font-orbitron font-bold text-xl sm:text-2xl tracking-widest uppercase" style={{ color: "#ff4466", textShadow: "0 0 20px #ff4466" }}>ТРАНСЛЯЦИИ</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ff4466]/30" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STREAMS.map((stream, i) => (
              <div key={i} className="hud-panel corner-deco rounded p-6 group hover:border-[#ff4466]/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-orbitron font-bold text-base text-white">{stream.platform}</span>
                  {stream.live ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ff4466] animate-pulse" style={{ boxShadow: "0 0 8px #ff4466" }} />
                      <span className="font-mono text-xs text-[#ff4466]">LIVE</span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs text-gray-600">OFFLINE</span>
                  )}
                </div>
                <div className="font-mono text-sm text-[#00f5ff] mb-2">{stream.channel}</div>
                <div className="font-rajdhani text-gray-400 text-sm mb-4">{stream.game}</div>
                {stream.live && (
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="Eye" size={12} className="text-gray-500" />
                    <span className="font-mono text-xs text-gray-400">{stream.viewers} зрителей</span>
                  </div>
                )}
                <button className={`w-full py-2 font-orbitron text-xs tracking-widest font-bold rounded border transition-all ${stream.live ? "border-[#ff4466]/50 text-[#ff4466] hover:bg-[#ff4466]/10" : "border-gray-800 text-gray-600 cursor-not-allowed"}`}>
                  {stream.live ? "СМОТРЕТЬ" : "УВЕДОМИТЬ"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" ref={(el) => (sectionsRef.current["contacts"] = el)} className="py-24 relative grid-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-16 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00f5ff]/30" />
            <h2 className="font-orbitron font-bold text-xl sm:text-2xl tracking-widest uppercase text-[#00f5ff]">КОНТАКТЫ</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00f5ff]/30" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="font-mono text-[#00f5ff]/50 text-xs tracking-widest mb-4">// CONNECT.INITIALIZE</div>
              <h3 className="font-orbitron font-bold text-2xl text-white mb-6">Связаться с командой</h3>
              <div className="space-y-4">
                {[
                  { icon: "Mail", label: "Email", val: "contact@nexusteam.gg", color: "#00f5ff" },
                  { icon: "MessageCircle", label: "Telegram", val: "@nexusteam_official", color: "#00ff88" },
                  { icon: "Instagram", label: "Социальные сети", val: "@nexusteam.gg", color: "#ff00ff" },
                  { icon: "MapPin", label: "Расположение", val: "Москва, Россия", color: "#ffaa00" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 flex items-center justify-center border flex-shrink-0" style={{ borderColor: `${c.color}50`, backgroundColor: `${c.color}10` }}>
                      <Icon name={c.icon} size={16} style={{ color: c.color }} />
                    </div>
                    <div>
                      <div className="font-mono text-xs text-gray-500 uppercase tracking-wider">{c.label}</div>
                      <div className="font-rajdhani text-white group-hover:text-[#00f5ff] transition-colors">{c.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hud-panel corner-deco rounded p-6">
              <div className="font-mono text-[#00f5ff]/50 text-xs tracking-widest mb-4">// SEND.MESSAGE</div>
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-xs text-gray-500 uppercase tracking-wider block mb-1.5">ИМЯ</label>
                  <input type="text" placeholder="ВВЕДИТЕ ИМЯ"
                    className="w-full bg-[#010203] border border-[#00f5ff]/20 text-white font-mono text-sm px-4 py-2.5 focus:outline-none focus:border-[#00f5ff]/60 placeholder-gray-700 transition-colors" />
                </div>
                <div>
                  <label className="font-mono text-xs text-gray-500 uppercase tracking-wider block mb-1.5">EMAIL</label>
                  <input type="email" placeholder="your@email.com"
                    className="w-full bg-[#010203] border border-[#00f5ff]/20 text-white font-mono text-sm px-4 py-2.5 focus:outline-none focus:border-[#00f5ff]/60 placeholder-gray-700 transition-colors" />
                </div>
                <div>
                  <label className="font-mono text-xs text-gray-500 uppercase tracking-wider block mb-1.5">СООБЩЕНИЕ</label>
                  <textarea rows={4} placeholder="ВВЕДИТЕ СООБЩЕНИЕ..."
                    className="w-full bg-[#010203] border border-[#00f5ff]/20 text-white font-mono text-sm px-4 py-2.5 focus:outline-none focus:border-[#00f5ff]/60 placeholder-gray-700 resize-none transition-colors" />
                </div>
                <button className="w-full py-3 font-orbitron font-bold text-sm tracking-widest text-[#020408] hover:shadow-[0_0_20px_#00f5ff] transition-all duration-200"
                  style={{ background: "linear-gradient(90deg, #00f5ff, #00ff88)", clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
                  ОТПРАВИТЬ
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#00f5ff]/10 py-8 bg-[#010203]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-black text-sm neon-cyan">NEXUS</span>
            <span className="font-orbitron text-sm text-gray-600">TEAM</span>
          </div>
          <div className="font-mono text-xs text-gray-700 text-center">© 2019–2025 NEXUS TEAM. ALL RIGHTS RESERVED.</div>
          <div className="font-mono text-xs text-[#00f5ff]/40">// SYSTEM.STATUS: ONLINE</div>
        </div>
      </footer>
    </div>
  );
}