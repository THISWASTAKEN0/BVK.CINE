import { ChevronDown, Instagram, Camera } from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/public/Navbar';
import CollectionGrid from '@/components/public/CollectionGrid';
import HeroTitle from '@/components/public/HeroTitle';
import GlassTiles from '@/components/public/GlassTiles';
import EmailReveal from '@/components/public/EmailReveal';
import ScrollReveal from '@/components/public/ScrollReveal';
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
  const coverIds   = collections.map((c) => c.cover_photo_id).filter(Boolean) as string[];
  const hoverIds   = collections.map((c) => c.hover_photo_id).filter(Boolean) as string[];
  const allPhotoIds = [...new Set([...coverIds, ...hoverIds])];

  const [{ data: photoCounts }, { data: photoData }] = await Promise.all([
    supabase.from('photos').select('collection_id').in('collection_id', collectionIds),
    allPhotoIds.length
      ? supabase.from('photos').select('id, cloudinary_public_id, cloudinary_url').in('id', allPhotoIds)
      : Promise.resolve({ data: [] }),
  ]);

  const countByCollection = (photoCounts ?? []).reduce<Record<string, number>>(
    (acc, p) => { acc[p.collection_id] = (acc[p.collection_id] ?? 0) + 1; return acc; }, {}
  );
  const photoById = (photoData ?? []).reduce<Record<string, { id: string; cloudinary_public_id: string; cloudinary_url: string }>>(
    (acc, p) => { acc[p.id] = p; return acc; }, {}
  );

  return collections.map((col) => ({
    ...col,
    photo_count: countByCollection[col.id] ?? 0,
    cover_photo:  col.cover_photo_id  ? (photoById[col.cover_photo_id]  ?? null) : null,
    hover_photo:  col.hover_photo_id  ? (photoById[col.hover_photo_id]  ?? null) : null,
  }));
}

export default async function Home() {
  const collections = await getCollections();

  return (
    <div className="public-site">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative h-screen w-full overflow-hidden">

        <div
          className="absolute pointer-events-none"
          style={{ top: '-10%', right: '-8%', width: '62%', height: '120%', filter: 'blur(80px) saturate(1.5)', zIndex: 1 }}
        >
          <div style={{ position:'absolute', top:'10%', left:'20%', width:'60%', height:'55%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(80,20,200,1) 0%,transparent 70%)', opacity:0.85, animation:'blob-a 11s ease-in-out infinite' }} />
          <div style={{ position:'absolute', top:'45%', left:'5%',  width:'55%', height:'48%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(15,50,200,1) 0%,transparent 70%)',  opacity:0.80, animation:'blob-b 14s ease-in-out infinite' }} />
          <div style={{ position:'absolute', top:'0%',  left:'50%', width:'50%', height:'45%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(20,80,255,1) 0%,transparent 70%)', opacity:0.70, animation:'blob-c 10s ease-in-out infinite' }} />
          <div style={{ position:'absolute', top:'55%', left:'35%', width:'50%', height:'42%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(120,30,220,1) 0%,transparent 70%)',opacity:0.65, animation:'blob-d 13s ease-in-out infinite' }} />
        </div>

        <GlassTiles />

        <div
          className="absolute bottom-0 inset-x-0 h-48 pointer-events-none hero-fade"
          style={{ zIndex: 2 }}
        />

        <div
          className="absolute inset-0 flex flex-col justify-end md:justify-center px-6 md:px-16 lg:px-24 pb-20 md:pb-0"
          style={{ zIndex: 3 }}
        >
          <div className="max-w-2xl w-full">
            <p
              className="hidden md:block text-[11px] font-semibold uppercase tracking-[0.35em] mb-7"
              style={{ color: 'var(--text-secondary)' }}
            >
              Photography Portfolio
            </p>

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

            <p
              className="text-[14px] md:text-[18px] font-light mb-8 tracking-wide"
              style={{ color: 'var(--text-secondary)' }}
            >
              Capturing light. Telling stories.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="#work"
                className="liquid-glass-pill flex-1 md:flex-none inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-[14px] font-semibold transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
                style={{ color: 'var(--text-primary)' }}
              >
                <Camera size={13} />
                View Work
              </a>

              <a
                href={`https://instagram.com/${INSTAGRAM.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass-pill flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Instagram size={13} />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce" style={{ zIndex: 3, color: 'var(--text-secondary)', opacity: 0.5 }}>
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ── Collections ──────────────────────────────── */}
      <section id="work" className="relative px-5 md:px-8 py-28 md:py-36">
        <div className="glow-blob w-[700px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05]" style={{ background: 'radial-gradient(ellipse, #5c8aff, #9b5bff)' }} />

        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
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
          </ScrollReveal>

          <CollectionGrid collections={collections} />
        </div>
      </section>

      {/* ── About ────────────────────────────────────── */}
      <section id="about" className="relative px-5 md:px-8 py-28 md:py-36">
        <div className="glow-blob w-[500px] h-[500px] top-0 right-0 opacity-[0.05]" style={{ background: '#9b5bff' }} />

        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="mb-16">
              <span className="liquid-glass-pill inline-block text-[11px] font-semibold uppercase tracking-[0.3em] px-3 py-1 rounded-full mb-4" style={{ color: 'var(--accent)' }}>
                About
              </span>
              <h2 className="text-heading font-light gradient-text">
                The Photographer
              </h2>
            </div>
          </ScrollReveal>

          <div className="max-w-xl mx-auto flex flex-col gap-8">
            <ScrollReveal delay={100}>
              <div className="liquid-glass rounded-2xl px-6 py-5">
                <p className="text-[17px] md:text-[19px] font-light leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  Hi, I&apos;m Bhavesh — photographer based in Buffalo Grove.
                  Capturing moments one at a time.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="grid grid-cols-2 gap-4">
                <div className="liquid-glass rounded-2xl px-5 py-5">
                  <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>3 Years</p>
                  <p className="text-[12px] mt-1 font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Experience</p>
                </div>
                <div className="liquid-glass rounded-2xl px-5 py-5">
                  <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>a6700</p>
                  <p className="text-[12px] mt-1 font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Primary Camera</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
            <div className="flex flex-wrap gap-2.5">
              {['Portrait', 'Sports', 'Events', 'Lifestyle'].map((tag) => (
                <span
                  key={tag}
                  className="liquid-glass-pill px-4 py-1.5 rounded-full text-[12px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────── */}
      <section id="contact" className="relative overflow-hidden py-32 md:py-44">
        <div className="contact-section-bg absolute inset-0" />

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, var(--accent) 0%, transparent 70%)',
            filter: 'blur(80px)',
            opacity: 0.12,
          }}
        />

        <ScrollReveal className="relative max-w-md mx-auto px-6 text-center">
          <span className="liquid-glass-pill inline-block text-[11px] font-semibold uppercase tracking-[0.3em] px-3 py-1 rounded-full mb-5" style={{ color: 'var(--text-secondary)' }}>
            Contact
          </span>
          <h2 className="text-display font-extralight mb-14 leading-tight" style={{ color: 'var(--text-primary)' }}>
            Let&apos;s connect.
          </h2>

          <div className="glass-bubble relative rounded-3xl p-8 flex flex-col items-center gap-5">
            <EmailReveal email={EMAIL} />

            <div className="w-full h-px" style={{ background: 'var(--border)' }} />

            <a
              href={`https://instagram.com/${INSTAGRAM.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 text-[15px] font-light transition-opacity hover:opacity-100 group w-full justify-center py-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span
                className="p-2.5 rounded-xl flex-shrink-0"
                style={{ background: 'var(--border)', border: '1px solid var(--border-strong)' }}
              >
                <Instagram size={15} style={{ color: 'var(--text-secondary)' }} />
              </span>
              {INSTAGRAM}
            </a>
          </div>
        </ScrollReveal>
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
