'use client';

import { Camera, Aperture, Image as ImageIcon, Film } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/*
  GlassTiles — proper CSS 3-D glass tiles.

  Each tile is a real 6-sided box rendered with transform-style: preserve-3d.
  The FRONT face uses backdrop-filter so it actually blurs the aurora blob
  gradient sitting behind it in the CSS layer — giving genuine glass feel.
  All 4 visible side faces (right / left / top / bottom) are individually lit
  to show the glass thickness.

  Animation trick: the float keyframe embeds the base tilt via a CSS custom
  property (--tile-tilt) so no transform exists on any ancestor → preserve-3d
  works correctly in all Chromium browsers.
*/

const S = 114;   // front face size (px)
const D = 20;    // glass depth / thickness (px)
const R = 26;    // corner radius — same value applied to front face AND
                 // the outer corners of every side face so they all match.

interface TileCfg {
  Icon:   LucideIcon;
  tilt:   string;          // initial 3-D pose
  tint:   string;          // rgba glass background tint
  sheen:  string;          // specular highlight colour
  edgeHi: string;          // bright edge colour
  edgeLo: string;          // dark edge colour
  top: string; right: string;
  dur: string; delay: string;
}

const TILES: TileCfg[] = [
  {
    Icon: Camera,
    tilt:   'rotateX(12deg) rotateY(-22deg) rotateZ(-5deg)',
    tint:   'rgba(148,188,255,0.13)',
    sheen:  'rgba(255,255,255,0.68)',
    edgeHi: 'rgba(158,202,255,0.44)',
    edgeLo: 'rgba(28,58,180,0.30)',
    top: '11%', right: '13%', dur: '5.2s', delay: '0s',
  },
  {
    Icon: Aperture,
    tilt:   'rotateX(8deg) rotateY(19deg) rotateZ(4deg)',
    tint:   'rgba(255,170,120,0.13)',
    sheen:  'rgba(255,212,180,0.64)',
    edgeHi: 'rgba(255,148,82,0.44)',
    edgeLo: 'rgba(158,52,12,0.30)',
    top: '37%', right: '3%', dur: '6.1s', delay: '0.75s',
  },
  {
    Icon: ImageIcon,
    tilt:   'rotateX(-9deg) rotateY(-18deg) rotateZ(3deg)',
    tint:   'rgba(108,225,168,0.11)',
    sheen:  'rgba(192,255,218,0.60)',
    edgeHi: 'rgba(86,212,150,0.38)',
    edgeLo: 'rgba(12,108,60,0.26)',
    top: '26%', right: '37%', dur: '4.9s', delay: '1.35s',
  },
  {
    Icon: Film,
    tilt:   'rotateX(13deg) rotateY(21deg) rotateZ(-4deg)',
    tint:   'rgba(192,136,255,0.13)',
    sheen:  'rgba(226,196,255,0.62)',
    edgeHi: 'rgba(172,108,255,0.40)',
    edgeLo: 'rgba(72,12,158,0.28)',
    top: '57%', right: '19%', dur: '5.7s', delay: '1.95s',
  },
];

/* ─────────────────────────────────────────────── */

export default function GlassTiles() {
  return (
    <>
      <style>{`
        /*
          Float animation: custom prop carries the base tilt so the
          keyframe only interpolates translateY while tilt stays constant.
          No ancestor transform needed → preserve-3d is not flattened.
        */
        @keyframes gtFloat {
          0%,100% { transform: var(--gt-tilt) translateY(0px);   }
          45%      { transform: var(--gt-tilt) translateY(-18px); }
          72%      { transform: var(--gt-tilt) translateY(-7px);  }
        }
        @keyframes gtShadow {
          0%,100% { transform: scaleX(1.00); opacity: 0.40; }
          45%      { transform: scaleX(0.68); opacity: 0.18; }
          72%      { transform: scaleX(0.86); opacity: 0.28; }
        }
      `}</style>

      {/* Outer wrapper — position only, no transform */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0,
        width: '54%',
        zIndex: 4,
        pointerEvents: 'none',
      }}>
        {TILES.map(({ Icon, tilt, tint, sheen, edgeHi, edgeLo, top, right, dur, delay }, i) => (

          <div key={i} style={{ position: 'absolute', top, right, width: S, height: S }}>

            {/* ── Shadow (sibling — never a preserve-3d ancestor) ── */}
            <div style={{
              position: 'absolute',
              top: S + 14,
              left: '9%',
              width: '82%',
              height: 16,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              filter: 'blur(11px)',
              animation: `gtShadow ${dur} ease-in-out ${delay} infinite`,
            }} />

            {/* ── 3-D tile box ── */}
            <div style={{
              position: 'absolute',
              inset: 0,
              transformStyle: 'preserve-3d',
              /* CSS custom property holds the static tilt; keyframe only
                 interpolates translateY, so no ambiguity for the browser. */
              ['--gt-tilt' as string]: tilt,
              animation: `gtFloat ${dur} ease-in-out ${delay} infinite`,
            }}>

              {/* ════ FRONT FACE ════ */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: R,
                background: `
                  radial-gradient(ellipse at 27% 22%, ${sheen} 0%, transparent 54%),
                  linear-gradient(152deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%),
                  ${tint}
                `,
                backdropFilter:       'blur(26px) saturate(2.0) brightness(1.10)',
                WebkitBackdropFilter: 'blur(26px) saturate(2.0) brightness(1.10)',
                border: '1px solid rgba(255,255,255,0.42)',
                boxShadow: `
                  0 2px 0 rgba(255,255,255,0.34) inset,
                  0 -1px 0 rgba(255,255,255,0.07) inset,
                  1px 0 0 rgba(255,255,255,0.18) inset
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.90)',
              }}>
                {/* Icon padded to sit inside the rounded safe-area */}
                <Icon size={40} strokeWidth={1.4} />
                {/* Top gloss band — radius matches front face */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '46%',
                  borderRadius: `${R}px ${R}px 50% 50% / ${R}px ${R}px 26% 26%`,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.24) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
              </div>

              {/* ════ RIGHT FACE ════
                  Outer corners use R — CSS caps them at D/2 automatically,
                  giving a consistent pill-edge that matches the front face. */}
              <div style={{
                position: 'absolute',
                top: 0, left: S, width: D, height: S,
                borderRadius: `0 ${R}px ${R}px 0`,
                transformOrigin: '0% 50%',
                transform: 'rotateY(90deg)',
                background: `linear-gradient(to bottom,
                  rgba(255,255,255,0.28) 0%,
                  ${edgeHi} 26%,
                  ${edgeLo} 68%,
                  rgba(0,0,0,0.24) 100%
                )`,
                border: '1px solid rgba(255,255,255,0.24)',
                borderLeft: 'none',
                backfaceVisibility: 'hidden',
              }} />

              {/* ════ LEFT FACE ════ */}
              <div style={{
                position: 'absolute',
                top: 0, left: -D, width: D, height: S,
                borderRadius: `${R}px 0 0 ${R}px`,
                transformOrigin: '100% 50%',
                transform: 'rotateY(-90deg)',
                background: `linear-gradient(to bottom,
                  rgba(255,255,255,0.22) 0%,
                  ${edgeHi} 33%,
                  ${edgeLo} 100%
                )`,
                border: '1px solid rgba(255,255,255,0.16)',
                borderRight: 'none',
                backfaceVisibility: 'hidden',
              }} />

              {/* ════ TOP FACE ════ */}
              <div style={{
                position: 'absolute',
                top: -D, left: 0, width: S, height: D,
                borderRadius: `${R}px ${R}px 0 0`,
                transformOrigin: '50% 100%',
                transform: 'rotateX(90deg)',
                background: `linear-gradient(to right,
                  rgba(255,255,255,0.32) 0%,
                  ${edgeHi} 50%,
                  rgba(255,255,255,0.14) 100%
                )`,
                border: '1px solid rgba(255,255,255,0.26)',
                borderBottom: 'none',
                backfaceVisibility: 'hidden',
              }} />

              {/* ════ BOTTOM FACE ════ */}
              <div style={{
                position: 'absolute',
                top: S, left: 0, width: S, height: D,
                borderRadius: `0 0 ${R}px ${R}px`,
                transformOrigin: '50% 0%',
                transform: 'rotateX(-90deg)',
                background: `linear-gradient(to right,
                  ${edgeLo} 0%,
                  ${edgeHi} 44%,
                  ${edgeLo} 100%
                )`,
                border: '1px solid rgba(255,255,255,0.13)',
                borderTop: 'none',
                backfaceVisibility: 'hidden',
              }} />

            </div>{/* end 3-D box */}
          </div>
        ))}
      </div>
    </>
  );
}
