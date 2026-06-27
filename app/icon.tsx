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
        background: 'transparent',
      }}
    >
      <div style={{ position: 'relative', width: 30, height: 26, display: 'flex' }}>
        {/* Viewfinder bump */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 9,
            width: 12,
            height: 7,
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
            width: 30,
            height: 21,
            background: 'linear-gradient(135deg, #1e2fa0 0%, #0e5a55 100%)',
            borderRadius: 5,
          }}
        />
      </div>
    </div>,
    { ...size }
  )
}
