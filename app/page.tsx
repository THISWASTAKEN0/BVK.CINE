import Image from 'next/image';
import { ChevronDown, Mail, Instagram, Camera } from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/public/Navbar';
import CollectionGrid from '@/components/public/CollectionGrid';
import ChromaticText from '@/components/public/ChromaticText';
import type { Collection } from '@/lib/types';

export const revalidate = 30;

const NAME      = process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME      ?? 'BVK.Cine';
const EMAIL     = process.env.NEXT_PUBLIC_PHOTOGRAPHER_EMAIL     ?? 'hello@bvkcine.com';
const INSTAGRAM = process.env.NEXT_PUBLIC_PHOTOGRAPHER_INSTAGRAM ?? '@bvkcine';

async function getCollections(): Promise<Collection[]> {
  const supabase = createServerClient();

  const { data: collections, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) { console.error('[homepage]', error); return []; }
  if (!collections?.length) return [];

  const collectionIds = collections.map((c) => c.id);
  const coverIds = collections.map((c) => c.cover_photo_id).filter(Boolean) as string[];

  const [{ data: photoCounts }, { data: coverPhotos }] = await Promise.all([
    supabase.from('photos').select('collection_id').in('collection_id', collectionIds),
    coverIds.length
      ? supabase.from('photos').select('id, cloudinary_public_id, cloudinary_url').in('id', coverIds)
      : Promise.resolve({ data: [] }),
  ]);

  const countByCollection = (photoCounts ?? []).reduce<Record<string, number>>(
    (acc, p) => { acc[p.collection_id] = (acc[p.collection_id] ?? 0) + 1; return acc; }, {}
  );
  const coverById = (coverPhotos ?? []).reduce<Record<string, { id: string; cloudinary_public_id: string; cloudinary_url: string }>>(
    (acc, p) => { acc[p.id] = p; return acc; }, {}
  );

  return collections.map((col) => ({
    ...col,
    photo_count: countByCollection[col.id] ?? 0,
    cover_photo: col.cover_photo_id ? (coverById[col.cover_photo_id] ?? null) : null,
  }));
}

async function getPortraitUrl(): Promise<string> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'portrait_url')
      .single();
    return data?.value ?? '';
  } catch {
    return '';
  }
}

export default async function Home() {
  const [collections, portraitUrl] = await Promise.all([
    getCollections(),
    getPortraitUrl(),
  ]);

  return (
    <div className="public-site">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center">

        {/* Pure black base */}
        <div className="absolute inset-0" style={{ background: '#06060a' }} />

        {/* Subtle dark vignette corners */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }} />

        {/* ── Chromatic aberration wave arc (SVG) ─────────
            SVG ellipse clip path gives a true arc shape.
            3 layers: warm left glow + blue right atmosphere + sweeping
            chromatic prismatic bands (cyan→green→white→red→blue→violet).  */}
        <svg
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          className="absolute bottom-0 inset-x-0 w-full pointer-events-none"
          style={{ height: '52vh', zIndex: 1 }}
        >
          <defs>
            {/* Arc clip — large ellipse with centre well below viewBox */}
            <clipPath id="wave-arc">
              <ellipse cx="720" cy="820" rx="1260" ry="780" />
            </clipPath>

            {/* Warm golden atmospheric glow — left hot-spot */}
            <radialGradient id="g-warm" cx="400" cy="220" r="680" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#ffd246" stopOpacity="1"   />
              <stop offset="10%"  stopColor="#ff9c18" stopOpacity="0.88"/>
              <stop offset="24%"  stopColor="#e03800" stopOpacity="0.55"/>
              <stop offset="46%"  stopColor="#640c00" stopOpacity="0.14"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0"   />
            </radialGradient>

            {/* Cool blue atmospheric glow — right side */}
            <radialGradient id="g-blue-atm" cx="1060" cy="140" r="520" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#003cff" stopOpacity="0.45"/>
              <stop offset="35%"  stopColor="#0011bb" stopOpacity="0.18"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0"   />
            </radialGradient>

            {/* Chromatic prismatic bands — wide spectrum, blue-heavy */}
            <linearGradient id="g-bands" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#000000" stopOpacity="0"   />
              <stop offset="20%"  stopColor="#000000" stopOpacity="0"   />
              <stop offset="30%"  stopColor="#00eeff" stopOpacity="0.85"/> {/* cyan      */}
              <stop offset="37%"  stopColor="#00ff66" stopOpacity="0.88"/> {/* green     */}
              <stop offset="43%"  stopColor="#ffffff" stopOpacity="0.70"/> {/* white hot */}
              <stop offset="49%"  stopColor="#ff2200" stopOpacity="0.90"/> {/* red       */}
              <stop offset="55%"  stopColor="#1a2fff" stopOpacity="0.95"/> {/* blue      */}
              <stop offset="61%"  stopColor="#7700ee" stopOpacity="0.80"/> {/* violet    */}
              <stop offset="67%"  stopColor="#0000cc" stopOpacity="0.60"/> {/* deep blue */}
              <stop offset="75%"  stopColor="#000022" stopOpacity="0.15"/> {/* fade      */}
              <stop offset="100%" stopColor="#000000" stopOpacity="0"   />
            </linearGradient>

            {/* Thin bright rim at the very edge of the arc */}
            <radialGradient id="g-rim" cx="720" cy="40" r="900" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0"   />
              <stop offset="88%"  stopColor="#ffffff" stopOpacity="0"   />
              <stop offset="94%"  stopColor="#ffe8b0" stopOpacity="0.45"/>
              <stop offset="97%"  stopColor="#ffffff" stopOpacity="0.22"/>
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0"   />
            </radialGradient>
          </defs>

          <g clipPath="url(#wave-arc)">
            {/* Layer 1 — warm left glow (pulses) */}
            <rect width="1440" height="1200" fill="url(#g-warm)">
              <animate attributeName="opacity"
                values="0.82;1.0;0.82" dur="7s" calcMode="ease" repeatCount="indefinite" />
            </rect>

            {/* Layer 2 — blue right atmosphere */}
            <rect width="1440" height="1200" fill="url(#g-blue-atm)" />

            {/* Layer 3 — chromatic bands sweeping left↔right */}
            <rect width="1440" height="1200" fill="url(#g-bands)">
              <animateTransform
                attributeName="transform" type="translate"
                values="420,0;-420,0;420,0"
                dur="18s"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                repeatCount="indefinite"
              />
            </rect>

            {/* Layer 4 — slow hue-cycling on the bands via a second offset pass */}
            <rect width="1440" height="1200" fill="url(#g-bands)" opacity="0.45">
              <animateTransform
                attributeName="transform" type="translate"
                values="-600,0;600,0;-600,0"
                dur="26s"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                repeatCount="indefinite"
              />
            </rect>

            {/* Layer 5 — rim highlight at arc edge */}
            <rect width="1440" height="1200" fill="url(#g-rim)" />
          </g>
        </svg>

        {/* Soft ambient halo above the arc — bleeds into hero bg */}
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            bottom: '22vh',
            height: '18vh',
            background: 'radial-gradient(ellipse at 32% 60%, rgba(255,160,40,0.22) 0%, transparent 55%), radial-gradient(ellipse at 72% 50%, rgba(0,60,255,0.14) 0%, transparent 50%)',
            filter: 'blur(28px)',
            zIndex: 1,
          }}
        />

        {/* Bottom page-bg fade so the wave blends into sections below */}
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #06060a, transparent)', zIndex: 2 }} />

        {/* ── Hero content ──────────────────────────── */}
        <div className="relative text-center px-6 max-w-4xl" style={{ zIndex: 3 }}>

          {/* Eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] mb-7"
            style={{ color: 'rgba(255,255,255,0.35)' }}>
            Photography Portfolio
          </p>

          {/* Main title — Satoshi font, subtle chromatic aberration only here */}
          <h1
            className="leading-[1.0] tracking-tight mb-6"
            style={{
              fontFamily: "'Satoshi', 'Inter', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(4rem, 10vw, 8.5rem)',
              letterSpacing: '-0.03em',
            }}
          >
            <ChromaticText text={NAME} animate />
          </h1>

          {/* Tagline */}
          <p className="text-[16px] md:text-[18px] font-light mb-10 tracking-wide"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            Capturing light. Telling stories.
          </p>

          {/* CTA buttons — pill glass style like reference */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="#work"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[14px] font-semibold text-white transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.22)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.12) inset',
              }}
            >
              <Camera size={13} />
              View Work
            </a>

            <a
              href="#about"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              About me
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce" style={{ zIndex: 3 }}>
          <ChevronDown size={18} className="text-white/20" />
        </div>
      </section>

      {/* ── Collections ──────────────────────────────── */}
      <section id="work" className="relative px-5 md:px-8 py-28 md:py-36">
        {/* Ambient glow */}
        <div className="glow-blob w-[800px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]" style={{ background: 'radial-gradient(ellipse, #5c8aff, #9b5bff)' }} />

        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10 px-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--accent)' }}>
                Selected Work
              </p>
              <h2 className="text-heading font-light gradient-text">
                Collections
              </h2>
            </div>
            <p className="hidden md:block text-[13px] pb-1" style={{ color: 'var(--text-secondary)' }}>
              {collections.length} collection{collections.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Iridescent glass panel */}
          <div
            className="relative rounded-3xl p-5 md:p-8 glass-bubble"
          >
            <CollectionGrid collections={collections} />
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────── */}
      <section id="about" className="relative px-5 md:px-8 py-28 md:py-36">
        <div className="glow-blob w-[500px] h-[500px] top-0 right-0 opacity-[0.05]" style={{ background: '#9b5bff' }} />

        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--accent)' }}>
              About
            </p>
            <h2 className="text-heading font-light gradient-text">
              The Photographer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Portrait */}
            <div
              className="card-iri relative rounded-3xl overflow-hidden aspect-[3/4]"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              }}
            >
              {portraitUrl ? (
                <Image
                  src={portraitUrl}
                  alt={`Portrait of ${NAME}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}>
                  <div className="w-20 h-20 rounded-full" style={{ background: 'var(--surface-2, var(--surface))' }} />
                  <p className="text-sm text-center px-8 leading-relaxed opacity-50">
                    Upload your portrait in the admin dashboard
                  </p>
                </div>
              )}
            </div>

            {/* Bio + stats */}
            <div className="flex flex-col justify-center gap-8">
              <p className="text-[18px] md:text-[20px] font-light leading-relaxed" style={{ color: 'rgba(220,220,245,0.75)' }}>
                Hi, I&apos;m Bhavesh — photographer based in Buffalo Grove.
                Capturing moments one at a time.
              </p>

              {/* Stat cards — inspired by image 3's blue accent card */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="rounded-2xl px-5 py-5"
                  style={{
                    background: 'linear-gradient(135deg, #3b6bff 0%, #6b3bff 100%)',
                    boxShadow: '0 8px 32px rgba(60,100,255,0.35), 0 1px 0 rgba(255,255,255,0.15) inset',
                  }}
                >
                  <p className="text-2xl font-semibold text-white">3 Years</p>
                  <p className="text-[12px] mt-1 text-white/60 font-medium uppercase tracking-wider">Experience</p>
                </div>

                <div
                  className="rounded-2xl px-5 py-5"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                  }}
                >
                  <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>a6700</p>
                  <p className="text-[12px] mt-1 font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Primary Camera</p>
                </div>
              </div>

              {/* Small neumorphic tag row */}
              <div className="flex flex-wrap gap-2.5">
                {['Portrait', 'Sports', 'Events', 'Lifestyle'].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-full text-[12px] font-medium"
                    style={{
                      background: 'rgba(92,138,255,0.1)',
                      border: '1px solid rgba(92,138,255,0.2)',
                      color: 'rgba(180,200,255,0.8)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────── */}
      <section id="contact" className="relative overflow-hidden py-32 md:py-44">
        <div className="absolute inset-0" style={{
          background: '#060710',
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(60, 10, 160, 0.5) 0%, transparent 58%),
            radial-gradient(ellipse at 82% 30%, rgba(15, 50, 180, 0.42) 0%, transparent 52%)
          `,
        }} />
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }} />

        {/* Decorative orb behind contact */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(ellipse, rgba(100,60,255,0.6) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative max-w-md mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-5" style={{ color: 'rgba(200,200,240,0.35)' }}>
            Contact
          </p>
          <h2 className="text-display font-extralight text-white mb-14 leading-tight">
            Let&apos;s connect.
          </h2>

          {/* Iridescent glass contact card */}
          <div className="glass-bubble relative rounded-3xl p-8 flex flex-col items-center gap-5">
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-3.5 text-[15px] font-light text-white/65 hover:text-white transition-colors group w-full justify-center py-1"
            >
              <span
                className="p-2.5 rounded-xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Mail size={15} className="text-white/45 group-hover:text-white transition-colors" />
              </span>
              {EMAIL}
            </a>

            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

            <a
              href={`https://instagram.com/${INSTAGRAM.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 text-[15px] font-light text-white/65 hover:text-white transition-colors group w-full justify-center py-1"
            >
              <span
                className="p-2.5 rounded-xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Instagram size={15} className="text-white/45 group-hover:text-white transition-colors" />
              </span>
              {INSTAGRAM}
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-center text-[12px] font-medium uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>
          © {new Date().getFullYear()} {NAME}
        </p>
      </footer>

    </div>
  );
}
