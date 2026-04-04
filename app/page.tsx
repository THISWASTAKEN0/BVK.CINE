import Image from 'next/image';
import { ChevronDown, Mail, Instagram } from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/public/Navbar';
import CollectionGrid from '@/components/public/CollectionGrid';
import ChromaticText from '@/components/public/ChromaticText';
import type { Collection } from '@/lib/types';

export const revalidate = 30;

const NAME      = process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME      ?? 'Alex Chen';
const EMAIL     = process.env.NEXT_PUBLIC_PHOTOGRAPHER_EMAIL     ?? 'hello@alexchen.com';
const INSTAGRAM = process.env.NEXT_PUBLIC_PHOTOGRAPHER_INSTAGRAM ?? '@alexchen';

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
        {/* Mesh gradient */}
        <div className="absolute inset-0" style={{
          background: '#07080f',
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(91, 60, 220, 0.38) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 15%, rgba(30, 80, 200, 0.42) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 85%, rgba(10, 120, 180, 0.28) 0%, transparent 50%),
            radial-gradient(ellipse at 0%   0%,  rgba(160, 30, 100, 0.18) 0%, transparent 45%),
            radial-gradient(ellipse at 100% 100%, rgba(60, 20, 160, 0.28) 0%, transparent 45%)
          `,
        }} />

        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        {/* Bottom fade into page bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#07080f]" />

        {/* Content */}
        <div className="absolute bottom-20 left-6 md:left-14 lg:left-24">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40 mb-5">
            Photography Portfolio
          </p>

          <h1 className="text-display font-light text-white tracking-tight">
            <ChromaticText text={NAME.toUpperCase()} animate />
          </h1>

          {/* Glass tagline pill */}
          <div className="inline-flex items-center mt-5 px-5 py-2.5 rounded-full" style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px) saturate(160%)',
            WebkitBackdropFilter: 'blur(16px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset',
          }}>
            <p className="text-sm md:text-base font-light text-white/75 tracking-wide">
              Capturing light. Telling stories.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <a
              href="#work"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #5b8bff, #8b5bff)',
                boxShadow: '0 4px 24px rgba(91,139,255,0.35)',
              }}
            >
              View Work
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={22} className="text-white/30" />
        </div>
      </section>

      {/* ── Collections ──────────────────────────────── */}
      <section id="work" className="relative px-6 md:px-8 py-24 md:py-32">
        {/* Ambient glow behind the panel */}
        <div className="glow-blob w-[700px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]" style={{ background: '#5b8bff' }} />

        <div className="max-w-7xl mx-auto">
          {/* Section label + heading sit above the glass panel */}
          <div className="mb-8 px-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-3" style={{ color: 'var(--accent)' }}>
              Work
            </p>
            <h2 className="text-heading font-bold gradient-text">
              Collections
            </h2>
          </div>

          {/* Large glass panel behind the cards */}
          <div
            className="relative rounded-3xl p-6 md:p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(40px) saturate(160%)',
              WebkitBackdropFilter: 'blur(40px) saturate(160%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.07) inset, 0 32px 80px rgba(0,0,0,0.45)',
            }}
          >
            {/* Top specular highlight */}
            <div
              className="absolute inset-x-16 top-0 h-px rounded-full pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
            />
            <CollectionGrid collections={collections} />
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────── */}
      <section id="about" className="relative px-6 md:px-8 py-24 md:py-32">
        {/* Ambient glow */}
        <div className="glow-blob w-[500px] h-[500px] bottom-0 right-0 opacity-[0.05]" style={{ background: '#8b5bff' }} />

        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-3" style={{ color: 'var(--accent)' }}>
              About
            </p>
            <h2 className="text-heading font-bold gradient-text">
              The Photographer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Portrait */}
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4]" style={{
              border: '1px solid var(--border)',
              boxShadow: '0 0 0 1px rgba(91,139,255,0.12), 0 24px 80px rgba(0,0,0,0.6)',
            }}>
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

            {/* Bio */}
            <div className="flex flex-col justify-center h-full">
              <p className="text-[18px] font-light leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                Hi, I&apos;m Bhavesh — photographer based in Buffalo Grove.
                Capturing moments one at a time.
              </p>

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-4 mt-10">
                {[
                  { value: '3 Years',     label: 'Experience' },
                  { value: 'Sony a6700',  label: 'Primary Camera' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl px-5 py-5"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                  >
                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────── */}
      <section id="contact" className="relative overflow-hidden py-28 md:py-40">
        {/* Background */}
        <div className="absolute inset-0" style={{
          background: '#06060e',
          backgroundImage: `
            radial-gradient(ellipse at 25% 50%, rgba(70, 20, 160, 0.45) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 30%, rgba(20, 60, 180, 0.38) 0%, transparent 55%)
          `,
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        <div className="relative max-w-lg mx-auto px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35 mb-4">
            Contact
          </p>
          <h2 className="text-display font-light text-white mb-12">
            <ChromaticText text="Let's connect." />
          </h2>

          {/* Glass card */}
          <div className="relative rounded-3xl p-8 flex flex-col items-center gap-5" style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset, 0 24px 80px rgba(0,0,0,0.5)',
          }}>
            <div className="absolute inset-x-12 top-0 h-px rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />

            <a href={`mailto:${EMAIL}`}
              className="flex items-center gap-3 text-lg font-light text-white/75 hover:text-white transition-colors group w-full justify-center"
            >
              <span className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Mail size={16} className="text-white/50 group-hover:text-white transition-colors" />
              </span>
              {EMAIL}
            </a>

            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

            <a
              href={`https://instagram.com/${INSTAGRAM.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-lg font-light text-white/75 hover:text-white transition-colors group w-full justify-center"
            >
              <span className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Instagram size={16} className="text-white/50 group-hover:text-white transition-colors" />
              </span>
              {INSTAGRAM}
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-center text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          © {new Date().getFullYear()} {NAME} — All rights reserved
        </p>
      </footer>
    </div>
  );
}
