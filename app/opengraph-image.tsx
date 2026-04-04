import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'BVK.Cine — Photography Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  const name = process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME ?? 'BVK.Cine';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '72px 80px',
          background: '#07080f',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Mesh gradient blobs */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(91,60,220,0.45) 0%, transparent 55%), radial-gradient(ellipse at 80% 15%, rgba(30,80,200,0.5) 0%, transparent 50%), radial-gradient(ellipse at 60% 85%, rgba(10,120,180,0.3) 0%, transparent 50%), radial-gradient(ellipse at 0% 0%, rgba(160,30,100,0.2) 0%, transparent 45%)',
          display: 'flex',
        }} />

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(7,8,15,0.7) 100%)',
          display: 'flex',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
          }}>
            Photography Portfolio
          </div>

          <div style={{
            fontSize: 96,
            fontWeight: 300,
            letterSpacing: '-0.03em',
            color: 'white',
            lineHeight: 1.05,
            display: 'flex',
          }}>
            {name.toUpperCase()}
          </div>

          <div style={{
            fontSize: 22,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.05em',
            display: 'flex',
          }}>
            Capturing light. Telling stories.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
