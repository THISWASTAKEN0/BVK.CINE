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
      <section className="relative h-screen w-full overflow-hidden">
        {/* Deep mesh gradient bg */}
        <div className="absolute inset-0" style={{
          background: '#080910',
          backgroundImage: `
            radial-gradient(ellipse at 15% 55%, rgba(80, 40, 220, 0.42) 0%, transparent 52%),
            radial-gradient(ellipse at 78% 12%, rgba(20, 70, 200, 0.45) 0%, transparent 48%),
            radial-gradient(ellipse at 55% 88%, rgba(10, 110, 180, 0.3) 0%, transparent 48%),
            radial-gradient(ellipse at 95% 60%, rgba(140, 20, 200, 0.22) 0%, transparent 42%),
            radial-gradient(ellipse at 5%  10%, rgba(160, 30, 120, 0.2) 0%, transparent 40%)
          `,
        }} />

        {/* Subtle film grain */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }} />

        {/* Large decorative iridescent orb — top right */}
        <div
          className="absolute -top-32 -right-32 w-[580px] h-[580px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 38% 35%, rgba(255,255,255,0.06) 0%, rgba(120,80,255,0.08) 40%, rgba(30,60,180,0.04) 70%, transparent 100%)',
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.07) inset,
              0 0 120px rgba(100,80,255,0.15),
              0 0 0 1px rgba(80,120,255,0.12)
            `,
            backdropFilter: 'blur(1px)',
            border: '1px solid transparent',
            backgroundClip: 'padding-box',
          }}
        >
          {/* Iridescent ring */}
          <div className="absolute inset-0 rounded-full" style={{
            background: 'conic-gradient(from 180deg, rgba(255,80,160,0.4), rgba(80,180,255,0.35), rgba(80,255,200,0.3), rgba(255,180,80,0.3), rgba(200,80,255,0.4), rgba(255,80,160,0.4))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))',
            animation: 'spin 20s linear infinite',
          }} />
        </div>

        {/* Smaller orb — bottom left */}
        <div
          className="absolute -bottom-20 -left-20 w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 42% 42%, rgba(255,255,255,0.04) 0%, rgba(80,200,180,0.06) 50%, transparent 100%)',
            boxShadow: '0 0 80px rgba(80,200,180,0.1)',
            border: '1px solid rgba(80,200,180,0.1)',
          }}
        >
          <div className="absolute inset-0 rounded-full" style={{
            background: 'conic-gradient(from 0deg, rgba(80,200,180,0.3), rgba(80,160,255,0.3), rgba(255,80,160,0.25), rgba(80,200,180,0.3))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))',
            animation: 'spin 28s linear infinite reverse',
          }} />
        </div>

        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080910]" />

        {/* ── Chromatic statement piece — sits BEHIND content ── */}
        {/* Three massive blurred blobs drift apart like a prism splitting light.
            The glass buttons sit on top — their backdrop-filter blur makes the
            colours bleed through the button faces. */}
        <div
          className="absolute pointer-events-none"
          style={{ inset: 0, zIndex: 1, overflow: 'hidden' }}
        >
          {/* Red channel */}
          <div style={{
            position: 'absolute',
            bottom: '12%',
            left: '2%',
            width: '62%',
            height: '68%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 50% 55%, rgba(255,15,15,0.55) 0%, rgba(255,15,15,0.25) 35%, transparent 70%)',
            filter: 'blur(55px)',
            mixBlendMode: 'screen',
            animation: 'ca-big-red 13s ease-in-out infinite',
          }} />
          {/* Green channel */}
          <div style={{
            position: 'absolute',
            bottom: '16%',
            left: '6%',
            width: '50%',
            height: '54%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(15,255,80,0.38) 0%, rgba(15,255,80,0.15) 35%, transparent 70%)',
            filter: 'blur(48px)',
            mixBlendMode: 'screen',
            animation: 'ca-big-green 13s ease-in-out infinite',
            animationDelay: '-4.5s',
          }} />
          {/* Blue channel */}
          <div style={{
            position: 'absolute',
            bottom: '10%',
            left: '-2%',
            width: '58%',
            height: '62%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 50% 55%, rgba(15,50,255,0.55) 0%, rgba(15,50,255,0.25) 35%, transparent 70%)',
            filter: 'blur(55px)',
            mixBlendMode: 'screen',
            animation: 'ca-big-blue 13s ease-in-out infinite',
            animationDelay: '-9s',
          }} />
        </div>

        {/* Hero content — sits above the chromatic blobs */}
        <div className="absolute bottom-24 left-6 md:left-14 lg:left-24 max-w-2xl" style={{ zIndex: 2 }}>
          {/* Eyebrow label */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #5c8aff, #b06aff)' }} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'rgba(200,200,240,0.5)' }}>
              Photography Portfolio
            </p>
          </div>

          {/* Main heading */}
          <h1 className="text-display font-extralight text-white tracking-tight">
            <ChromaticText text={NAME.toUpperCase()} animate />
          </h1>

          {/* Tagline */}
          <p className="mt-5 text-[16px] md:text-[18px] font-light tracking-wide" style={{ color: 'rgba(200,200,240,0.5)' }}>
            Capturing light. Telling stories.
          </p>

          {/* CTA row — both fully liquid glass so chromatic blobs bleed through */}
          <div className="mt-9 flex items-center gap-4">
            {/* Primary — blue-tinted glass with glow */}
            <a
              href="#work"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-[14px] font-semibold text-white transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: 'rgba(80, 120, 255, 0.18)',
                backdropFilter: 'blur(24px) saturate(200%) brightness(1.2)',
                WebkitBackdropFilter: 'blur(24px) saturate(200%) brightness(1.2)',
                border: '1px solid rgba(120, 160, 255, 0.45)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 8px 40px rgba(80,120,255,0.3)',
              }}
            >
              <Camera size={14} />
              View Work
            </a>

            {/* Secondary — pure glass */}
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[14px] font-medium transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(24px) saturate(180%) brightness(1.1)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(1.1)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.75)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset',
              }}
            >
              About me
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce">
          <ChevronDown size={18} className="text-white/25" />
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
            <ChromaticText text="Let's connect." />
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
