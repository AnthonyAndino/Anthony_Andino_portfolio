import React from 'react';

export const OrbitalBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Radial ambient glow */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-orange-600/5 blur-[140px]" />
      <div className="absolute top-1/2 -right-40 w-[700px] h-[700px] rounded-full bg-amber-500/5 blur-[160px]" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[140px]" />

      {/* SVG Orbital Arcs inspired by Context Engine & Knowledge Graph */}
      <svg
        className="w-full h-full opacity-40"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Left Orbital Curves */}
        <path
          d="M-200 450 C 200 100, 450 700, 700 950"
          stroke="#ff6b35"
          strokeWidth="1.2"
          strokeOpacity="0.25"
          strokeDasharray="4 8"
        />
        <path
          d="M-300 200 C 100 -50, 350 500, 600 1100"
          stroke="#ff8c42"
          strokeWidth="0.8"
          strokeOpacity="0.18"
        />
        <path
          d="M-100 800 C 300 300, 600 600, 900 100"
          stroke="#3d414e"
          strokeWidth="1"
          strokeOpacity="0.3"
          strokeDasharray="3 6"
        />

        {/* Right Orbital Curves */}
        <path
          d="M800 -100 C 1100 400, 1300 200, 1600 700"
          stroke="#ff6b35"
          strokeWidth="1"
          strokeOpacity="0.22"
          strokeDasharray="5 7"
        />
        <path
          d="M950 -50 C 1200 600, 1450 350, 1700 950"
          stroke="#00d2ff"
          strokeWidth="0.75"
          strokeOpacity="0.15"
        />

        {/* Subtle grid points */}
        <circle cx="280" cy="340" r="2.5" fill="#ff6b35" fillOpacity="0.4" />
        <circle cx="890" cy="520" r="2" fill="#00d2ff" fillOpacity="0.35" />
        <circle cx="1120" cy="220" r="2.5" fill="#ff8c42" fillOpacity="0.3" />
        <circle cx="540" cy="740" r="1.8" fill="#e6edf3" fillOpacity="0.2" />
      </svg>
    </div>
  );
};
