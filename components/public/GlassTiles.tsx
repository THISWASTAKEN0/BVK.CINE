'use client';

import { useEffect, useState } from 'react';
import { Camera, Aperture, Image as ImageIcon, Film } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Base dimensions at desktop size
const BASE_S    = 114;   // front face size (px)
const BASE_D    = 20;    // glass thickness (px)
const BASE_R    = 26;    // corner radius (px)
const BASE_ICON = 40;    // lucide icon size (px)
const MOBILE_SCALE = 0.70;

interface TileColor {
  tint:   string;   // rgba fill on front face
  border: string;   // border color
  glow:   string;   // box-shadow glow color
  icon:   string;   // icon stroke color
  shadow: string;   // drop-shadow on icon
}

interface TileCfg {
  Icon:   LucideIcon;
  color:  TileColor;
  tilt:   string;
  top: string; right: string;
  mTop: string; mRight: string;
  dur: string; delay: string;
}

const TILES: TileCfg[] = [
  {
    Icon:  Camera,
    color: {
      tint:   'rgba(249,115,22,0.18)',
      border: 'rgba(249,115,22,0.52)',
      glow:   'rgba(249,115,22,0.28)',
      icon:   '#F97316',
      shadow: 'rgba(249,115,22,0.50)',
    },
    tilt:  'rotateX(12deg) rotateY(-22deg) rotateZ(-5deg)',
    top: '11%', right: '13%',
    mTop: '8%',  mRight: '6%',
    dur: '5.2s', delay: '0s',
  },
  {
    Icon:  Aperture,
    color: {
      tint:   'rgba(139,92,246,0.18)',
      border: 'rgba(139,92,246,0.50)',
      glow:   'rgba(139,92,246,0.26)',
      icon:   '#A855F7',
      shadow: 'rgba(139,92,246,0.48)',
    },
    tilt:  'rotateX(8deg) rotateY(19deg) rotateZ(4deg)',
    top: '37%', right: '3%',
    mTop: '42%', mRight: '2%',
    dur: '6.1s', delay: '0.75s',
  },
  {
    Icon:  ImageIcon,
    color: {
      tint:   'rgba(59,130,246,0.18)',
      border: 'rgba(59,130,246,0.50)',
      glow:   'rgba(59,130,246,0.26)',
      icon:   '#60A5FA',
      shadow: 'rgba(59,130,246,0.48)',
    },
    tilt:  'rotateX(-9deg) rotateY(-18deg) rotateZ(3deg)',
    top: '26%', right: '37%',
    mTop: '24%', mRight: '28%',
    dur: '4.9s', delay: '1.35s',
  },
  {
    Icon:  Film,
    color: {
      tint:   'rgba(6,182,212,0.18)',
      border: 'rgba(6,182,212,0.48)',
      glow:   'rgba(6,182,212,0.24)',
      icon:   '#22D3EE',
      shadow: 'rgba(6,182,212,0.46)',
    },
    tilt:  'rotateX(13deg) rotateY(21deg) rotateZ(-4deg)',
    top: '57%', right: '19%',
    mTop: '50%', mRight: '14%',
    dur: '5.7s', delay: '1.95s',
  },
];

const edgeBase = {
  backdropFilter:       'blur(18px) saturate(1.6) brightness(1.15)',
  WebkitBackdropFilter: 'blur(18px) saturate(1.6) brightness(1.15)',
  backfaceVisibility:   'hidden' as const,
};

export default function GlassTiles() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => setScale(window.innerWidth < 768 ? MOBILE_SCALE : 1);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const S    = BASE_S    * scale;
  const D    = BASE_D    * scale;
  const R    = BASE_R    * scale;
  const icon = Math.round(BASE_ICON * scale);

  return (
    <>
      <style>{`
        @keyframes gtFloat {
          0%,100% { transform: var(--gt-tilt) translateY(0px);   }
          45%      { transform: var(--gt-tilt) translateY(-18px); }
          72%      { transform: var(--gt-tilt) translateY(-7px);  }
        }
        @keyframes gtShadow {
          0%,100% { transform: scaleX(1.00); opacity: 0.38; }
          45%      { transform: scaleX(0.66); opacity: 0.16; }
          72%      { transform: scaleX(0.84); opacity: 0.26; }
        }
      `}</style>

      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0,
        width: '54%',
        zIndex: 4,
        pointerEvents: 'none',
      }}>
        {TILES.map(({ Icon, color, tilt, top, right, mTop, mRight, dur, delay }, i) => (
          <div key={i} style={{
            position: 'absolute',
            top:   scale < 1 ? mTop   : top,
            right: scale < 1 ? mRight : right,
            width: S, height: S,
          }}>

            {/* Floating shadow */}
            <div style={{
              position: 'absolute',
              top: S + 14, left: '9%',
              width: '82%', height: 16,
              borderRadius: '50%',
              background: 'rgba(20,40,100,0.18)',
              filter: 'blur(14px)',
              animation: `gtShadow ${dur} ease-in-out ${delay} infinite`,
            }} />

            {/* 3-D box */}
            <div style={{
              position: 'absolute', inset: 0,
              transformStyle: 'preserve-3d',
              ['--gt-tilt' as string]: tilt,
              animation: `gtFloat ${dur} ease-in-out ${delay} infinite`,
            }}>

              {/* FRONT FACE — per-tile color tint + specular rim */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: R,
                background: `
                  linear-gradient(145deg,
                    rgba(255,255,255,0.26) 0%,
                    rgba(255,255,255,0.08) 38%,
                    ${color.tint} 100%)
                `,
                backdropFilter:       'blur(28px) saturate(1.8) brightness(1.10)',
                WebkitBackdropFilter: 'blur(28px) saturate(1.8) brightness(1.10)',
                border: `1px solid ${color.border}`,
                boxShadow: `
                  0 2px 0 rgba(255,255,255,0.38) inset,
                  0 -1px 0 rgba(255,255,255,0.08) inset,
                  1px 0 0 rgba(255,255,255,0.22) inset,
                  0 0 28px ${color.glow}
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Colored icon with extrusion drop-shadows */}
                <div style={{
                  color: color.icon,
                  filter: [
                    'drop-shadow(0 -2px   0   rgba(255,255,255,0.60))',
                    `drop-shadow(0    3px 0   rgba(0,0,0,0.75))`,
                    `drop-shadow(2px  0   0   rgba(0,0,0,0.45))`,
                    `drop-shadow(0    5px 8px ${color.shadow})`,
                  ].join(' '),
                }}>
                  <Icon size={icon} strokeWidth={1.6} />
                </div>

                {/* Top-left gloss streak */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '42%',
                  borderRadius: `${R}px ${R}px 50% 50% / ${R}px ${R}px 22% 22%`,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
              </div>

              {/* RIGHT FACE */}
              <div style={{
                position: 'absolute',
                top: R, left: S, width: D, height: S - 2 * R,
                transformOrigin: '0% 50%',
                transform: 'rotateY(90deg)',
                background: `linear-gradient(to bottom,
                  rgba(255,255,255,0.52) 0%,
                  rgba(255,255,255,0.24) 40%,
                  rgba(255,255,255,0.10) 75%,
                  rgba(255,255,255,0.04) 100%
                )`,
                borderRight: '1px solid rgba(255,255,255,0.22)',
                ...edgeBase,
              }} />

              {/* LEFT FACE */}
              <div style={{
                position: 'absolute',
                top: R, left: -D, width: D, height: S - 2 * R,
                transformOrigin: '100% 50%',
                transform: 'rotateY(-90deg)',
                background: `linear-gradient(to bottom,
                  rgba(255,255,255,0.42) 0%,
                  rgba(255,255,255,0.18) 45%,
                  rgba(255,255,255,0.06) 100%
                )`,
                borderLeft: '1px solid rgba(255,255,255,0.18)',
                ...edgeBase,
              }} />

              {/* TOP FACE */}
              <div style={{
                position: 'absolute',
                top: -D, left: R, width: S - 2 * R, height: D,
                transformOrigin: '50% 100%',
                transform: 'rotateX(90deg)',
                background: `linear-gradient(to right,
                  rgba(255,255,255,0.42) 0%,
                  rgba(255,255,255,0.30) 50%,
                  rgba(255,255,255,0.18) 100%
                )`,
                borderTop: '1px solid rgba(255,255,255,0.32)',
                ...edgeBase,
              }} />

              {/* BOTTOM FACE */}
              <div style={{
                position: 'absolute',
                top: S, left: R, width: S - 2 * R, height: D,
                transformOrigin: '50% 0%',
                transform: 'rotateX(-90deg)',
                background: `linear-gradient(to right,
                  rgba(255,255,255,0.12) 0%,
                  rgba(255,255,255,0.26) 50%,
                  rgba(255,255,255,0.12) 100%
                )`,
                borderBottom: '1px solid rgba(255,255,255,0.14)',
                ...edgeBase,
              }} />

            </div>
          </div>
        ))}
      </div>
    </>
  );
}
