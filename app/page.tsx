import Image from 'next/image';
import { ChevronDown, Instagram, Camera } from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/public/Navbar';
import CollectionGrid from '@/components/public/CollectionGrid';
import ChromaticText from '@/components/public/ChromaticText';
import HeroTitle from '@/components/public/HeroTitle';
import GlassTiles from '@/components/public/GlassTiles';
import EmailReveal from '@/components/public/EmailReveal';
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

        {/* Near-black base */}
        <div className="absolute inset-0" style={{ background: '#08090e' }} />

        {/* ── Fluid aurora blob — right side ─────────────
            Unblurred coloured ellipses inside a heavily-blurred container
            produce a smooth organic light-leak similar to the reference.   */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-10%',
            right: '-8%',
            width: '62%',
            height: '120%',
            filter: 'blur(72px) saturate(1.4)',
            zIndex: 1,
          }}
        >
          {/* Orange */}
          <div style={{
            position: 'absolute', top: '18%', left: '30%', width: '55%', height: '45%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, #ff6820 0%, transparent 70%)',
            opacity: 0.9,
            animation: 'blob-a 11s ease-in-out infinite',
          }} />
          {/* Deep red */}
          <div style={{
            position: 'absolute', top: '38%', left: '10%', width: '50%', height: '42%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, #cc1450 0%, transparent 70%)',
            opacity: 0.85,
            animation: 'blob-b 14s ease-in-out infinite',
          }} />
          {/* Electric blue */}
          <div style={{
            position: 'absolute', top: '5%', left: '55%', width: '48%', height: '50%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, #1a2fff 0%, transparent 70%)',
            opacity: 0.8,
            animation: 'blob-c 10s ease-in-out infinite',
          }} />
          {/* Purple */}
          <div style={{
            position: 'absolute', top: '55%', left: '40%', width: '52%', height: '44%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, #7a10cc 0%, transparent 70%)',
            opacity: 0.75,
            animation: 'blob-d 13s ease-in-out infinite',
          }} />
          {/* Cyan accent */}
          <div style={{
            position: 'absolute', top: '0%', left: '20%', width: '40%', height: '35%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, #00c8ff 0%, transparent 70%)',
            opacity: 0.55,
            animation: 'blob-a 16s ease-in-out infinite reverse',
          }} />
        </div>

        {/* ── 3-D glass icon tiles ── */}
        <GlassTiles />

        {/* Desktop: left-edge fade keeps text readable against the aurora */}
        <div
          className="absolute inset-0 pointer-events-none hidden md:block"
          style={{
            background: 'linear-gradient(to right, #08090e 28%, rgba(8,9,14,0.7) 52%, transparent 75%)',
            zIndex: 2,
          }}
        />
        {/* Mobile: dark on left so text reads cleanly, open on right so tiles stay colourful */}
        <div
          className="absolute inset-0 pointer-events-none md:hidden"
          style={{
            background: 'linear-gradient(to right, #08090e 30%, rgba(8,9,14,0.70) 52%, rgba(8,9,14,0.15) 80%, transparent 100%)',
            zIndex: 2,
          }}
        />

        {/* Bottom fade into next section */}
        <div
          className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #08090e, transparent)', zIndex: 2 }}
        />

        {/* ── Hero content ──────────────────────────────
            Mobile: bottom-anchored, left-aligned, minimal.
            Desktop: vertically centred, left-aligned.    */}
        <div
          className="absolute inset-0 flex flex-col justify-end md:justify-center px-6 md:px-16 lg:px-24 pb-20 md:pb-0"
          style={{ zIndex: 3 }}
        >
          <div className="max-w-2xl w-full">

            {/* Eyebrow — desktop only, mobile is already minimal */}
            <p
              className="hidden md:block text-[11px] font-semibold uppercase tracking-[0.35em] mb-7"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Photography Portfolio
            </p>

            {/* Main title */}
            <h1
              className="leading-[1.0] tracking-tight mb-4 md:mb-6"
              style={{
                fontFamily: "'Satoshi', 'Inter', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(3.4rem, 14vw, 8rem)',
                letterSpacing: '-0.03em',
              }}
            >
              <HeroTitle name={NAME} />
            </h1>

            {/* Tagline */}
            <p
              className="text-[14px] md:text-[18px] font-light mb-8 tracking-wide"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Capturing light. Telling stories.
            </p>

            {/* CTA buttons */}
            <div className="flex items-center gap-3">
              <a
                href="#work"
                className="liquid-glass-pill flex-1 md:flex-none inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-[14px] font-semibold text-white transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
              >
                <Camera size={13} />
                View Work
              </a>

              <a
                href={`https://instagram.com/${INSTAGRAM.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass-pill flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                <Instagram size={13} />
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce" style={{ zIndex: 3 }}>
          <ChevronDown size={18} className="text-white/20" />
        </div>
      </section>

      {/* ── Collections ──────────────────────────────── */}
      <section id="work" className="relative px-5 md:px-8 py-28 md:py-36">
        <div className="glow-blob w-[700px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05]" style={{ background: 'radial-gradient(ellipse, #5c8aff, #9b5bff)' }} />

        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-12 px-1">
            <div>
              <span className="liquid-glass-pill inline-block text-[11px] font-semibold uppercase tracking-[0.3em] px-3 py-1 rounded-full mb-4" style={{ color: 'var(--accent)' }}>
                Selected Work
              </span>
              <h2 className="text-heading font-light gradient-text">
                Collections
              </h2>
            </div>
            <p className="hidden md:block text-[13px] pb-1" style={{ color: 'var(--text-secondary)' }}>
              {collections.length} collection{collections.length !== 1 ? 's' : ''}
            </p>
          </div>

          <CollectionGrid collections={collections} />
        </div>
      </section>

      {/* ── About ────────────────────────────────────── */}
      <section id="about" className="relative px-5 md:px-8 py-28 md:py-36">
        <div className="glow-blob w-[500px] h-[500px] top-0 right-0 opacity-[0.05]" style={{ background: '#9b5bff' }} />

        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="liquid-glass-pill inline-block text-[11px] font-semibold uppercase tracking-[0.3em] px-3 py-1 rounded-full mb-4" style={{ color: 'var(--accent)' }}>
              About
            </span>
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
              <div className="liquid-glass rounded-2xl px-6 py-5">
                <p className="text-[17px] md:text-[19px] font-light leading-relaxed" style={{ color: 'rgba(220,220,245,0.80)' }}>
                  Hi, I&apos;m Bhavesh — photographer based in Buffalo Grove.
                  Capturing moments one at a time.
                </p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="liquid-glass rounded-2xl px-5 py-5">
                  <p className="text-2xl font-semibold text-white">3 Years</p>
                  <p className="text-[12px] mt-1 font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.40)' }}>Experience</p>
                </div>
                <div className="liquid-glass rounded-2xl px-5 py-5">
                  <p className="text-2xl font-semibold text-white">a6700</p>
                  <p className="text-[12px] mt-1 font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.40)' }}>Primary Camera</p>
                </div>
              </div>

              {/* Tag row */}
              <div className="flex flex-wrap gap-2.5">
                {['Portrait', 'Sports', 'Events', 'Lifestyle'].map((tag) => (
                  <span
                    key={tag}
                    className="liquid-glass-pill px-4 py-1.5 rounded-full text-[12px] font-medium"
                    style={{ color: 'rgba(200, 210, 255, 0.80)' }}
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
          <span className="liquid-glass-pill inline-block text-[11px] font-semibold uppercase tracking-[0.3em] px-3 py-1 rounded-full mb-5" style={{ color: 'rgba(200,200,240,0.50)' }}>
            Contact
          </span>
          <h2 className="text-display font-extralight text-white mb-14 leading-tight">
            Let&apos;s connect.
          </h2>

          {/* Iridescent glass contact card */}
          <div className="glass-bubble relative rounded-3xl p-8 flex flex-col items-center gap-5">
            <EmailReveal email={EMAIL} />

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
