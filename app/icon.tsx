import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        borderRadius: '50%',
      }}
    >
      <div style={{ position: 'relative', width: 24, height: 20, display: 'flex' }}>
        {/* Viewfinder bump */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 7,
            width: 10,
            height: 6,
            background: 'linear-gradient(135deg, #1e2fa0 0%, #0e5a55 100%)',
            borderRadius: '3px 3px 0 0',
          }}
        />
        {/* Camera body */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 24,
            height: 16,
            background: 'linear-gradient(135deg, #1e2fa0 0%, #0e5a55 100%)',
            borderRadius: 4,
          }}
        />
      </div>
    </div>,
    { ...size }
  )
}
