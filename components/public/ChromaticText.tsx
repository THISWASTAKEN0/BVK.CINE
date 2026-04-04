'use client';

interface Props {
  text: string;
  className?: string;
  animate?: boolean;
}

// Three blurry RGB ghost layers behind crisp white text.
// Red offset right, green offset up, blue offset left — all blurred.
// The real text sits on top: sharp and white.
export default function ChromaticText({ text, className = '', animate = false }: Props) {
  return (
    <span className={`chromatic-root ${animate ? 'chromatic-animate' : ''} ${className}`}>
      <span className="chromatic-red"  aria-hidden="true">{text}</span>
      <span className="chromatic-green" aria-hidden="true">{text}</span>
      <span className="chromatic-blue"  aria-hidden="true">{text}</span>
      <span className="chromatic-main">{text}</span>
    </span>
  );
}
