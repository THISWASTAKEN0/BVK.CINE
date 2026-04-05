'use client';

import { useEffect, useState } from 'react';
import ChromaticText from './ChromaticText';

/*
  HeroTitle — splits "BVK.Cine" at the first dot and animates each
  word in sequence after mount.  Using a client component + useEffect
  guarantees the animation fires on every page load / SPA navigation,
  regardless of how the browser handles pre-painted SSR HTML.
*/
export default function HeroTitle({ name }: { name: string }) {
  const [go, setGo] = useState(false);

  useEffect(() => {
    // Double rAF: outer rAF waits for the initial invisible paint to be
    // committed, inner rAF fires in the *next* frame so the browser has a
    // distinct "from" state to animate from. Single rAF is not enough —
    // React's re-render and the first paint can collapse into one frame.
    let inner: number;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setGo(true));
    });
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
  }, []);

  const dot   = name.indexOf('.');
  const part1 = dot !== -1 ? name.slice(0, dot) : name;
  const part2 = dot !== -1 ? name.slice(dot)    : '';

  return (
    <>
      {/* BVK */}
      <span
        style={{
          display: 'inline-block',
          opacity: go ? undefined : 0,
          animation: go
            ? 'heroWordIn 0.85s cubic-bezier(0.22,1,0.36,1) 0.05s both'
            : 'none',
        }}
      >
        <ChromaticText text={part1} animate />
      </span>

      {/* .Cine — 300 ms after BVK */}
      {part2 && (
        <span
          style={{
            display: 'inline-block',
            opacity: go ? undefined : 0,
            animation: go
              ? 'heroWordIn 0.85s cubic-bezier(0.22,1,0.36,1) 0.35s both'
              : 'none',
          }}
        >
          <ChromaticText text={part2} animate />
        </span>
      )}
    </>
  );
}
