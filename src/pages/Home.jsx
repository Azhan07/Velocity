import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import CarCanvas from '../components/three/CarCanvas';
import HeroScene from '../components/three/HeroScene';
import HeroSection from '../components/home/HeroSection';
import ScrollStory, { CHAPTERS } from '../components/home/ScrollStory';
import FeaturedCars from '../components/home/FeaturedCars';
import Magnetic from '../components/ui/Magnetic';
import useReducedMotion from '../hooks/useReducedMotion';
import { useIsMobile } from '../hooks/useDevice';
import { onReady } from '../utils/ready';
import { engine } from '../utils/engineSound';

gsap.registerPlugin(ScrollTrigger);

const MANIFESTO =
  'We do not build cars to get you somewhere. We build them so the journey becomes the destination — every curve a conversation, every straight a promise kept.';

export default function Home() {
  const root = useRef(null);
  const story = useRef(null);
  const hero = useRef(null);
  const rail = useRef(null);
  const chapterLabel = useRef(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  // Mouse parallax input (normalised -1..1), read by the 3D scene every frame
  useEffect(() => {
    const onMove = (e) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ---------- 1. Hero text intro (waits for the preloader) ---------- */
      const words = gsap.utils.toArray('[data-hero="word"]');
      const others = gsap.utils.toArray('[data-hero="eyebrow"], [data-hero="sub"], [data-hero="cta"], [data-hero="specs"], [data-hero="scroll"]');
      if (!reduced) {
        gsap.set(words, { yPercent: 110 });
        gsap.set(others, { autoAlpha: 0, y: 24 });
      }
      const offReady = onReady(() => {
        if (reduced) return;
        const tl = gsap.timeline({ delay: 1.2 });
        tl.to(words, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' })
          .to(others, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, '-=0.7');
      });

      /* ---------- 2. Whole story: scroll progress drives the 3D camera ---------- */
      let idle;
      ScrollTrigger.create({
        trigger: story.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: reduced ? false : 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          if (rail.current) rail.current.style.transform = `scaleY(${self.progress})`;
          const idx = Math.min(CHAPTERS.length, Math.round(self.progress * CHAPTERS.length));
          if (chapterLabel.current) chapterLabel.current.textContent = idx === 0 ? '00 · Intro' : `0${idx} · ${CHAPTERS[idx - 1].eyebrow}`;
          // Engine sound revs with scroll speed (only if the user switched sound on)
          const v = Math.abs(self.getVelocity());
          engine.setRPM(900 + Math.min(v * 2.2, 7500), 0.08);
          clearTimeout(idle);
          idle = setTimeout(() => engine.setRPM(900, 0.4), 160);
        },
      });

      /* ---------- 3. Hero text drifts away as you start scrolling ---------- */
      if (!reduced) {
        gsap.to(hero.current, {
          autoAlpha: 0,
          y: -120,
          ease: 'none',
          scrollTrigger: { trigger: hero.current, start: 'top top', end: 'bottom 35%', scrub: true },
        });
      }

      /* ---------- 4. Chapters reveal in sync with the camera ---------- */
      gsap.utils.toArray('[data-chapter]').forEach((section) => {
        const title = section.querySelector('[data-reveal-title]');
        const items = section.querySelectorAll('[data-reveal]');
        const counters = section.querySelectorAll('[data-count]');
        if (reduced) return;
        gsap.set(title, { yPercent: 110 });
        gsap.set(items, { autoAlpha: 0, y: 30 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top 62%', end: 'bottom 30%', toggleActions: 'play reverse play reverse' },
        });
        tl.to(title, { yPercent: 0, duration: 0.9, ease: 'expo.out' })
          .to(items, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, '-=0.6');
        counters.forEach((el) => {
          const end = parseFloat(el.dataset.count);
          const dec = parseInt(el.dataset.decimals, 10);
          const suffix = el.dataset.suffix;
          const obj = { v: 0 };
          tl.to(
            obj,
            {
              v: end,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: () => (el.textContent = obj.v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix),
            },
            0.3
          );
        });
      });

      /* ---------- 5. Manifesto: words light up one by one while scrolling ---------- */
      const mWords = gsap.utils.toArray('[data-mword]');
      if (!reduced) {
        gsap.fromTo(
          mWords,
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.05,
            ease: 'none',
            scrollTrigger: { trigger: '[data-manifesto]', start: 'top 75%', end: 'bottom 45%', scrub: true },
          }
        );
      }

      /* ---------- 6. Final CTA: huge text slides in from both sides ---------- */
      if (!reduced) {
        gsap.fromTo('[data-cta-left]', { xPercent: -30 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '[data-cta]', start: 'top bottom', end: 'center center', scrub: true } });
        gsap.fromTo('[data-cta-right]', { xPercent: 30 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '[data-cta]', start: 'top bottom', end: 'center center', scrub: true } });
      }

      return () => {
        offReady();
        clearTimeout(idle);
      };
    }, root);

    return () => ctx.revert(); // kills every timeline & ScrollTrigger created above
  }, [reduced]);

  return (
    <div ref={root}>
      {/* ===== Hero + scroll story share ONE pinned 3D canvas ===== */}
      <section ref={story} className="relative" aria-label="VX-1 cinematic introduction">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <CarCanvas className="h-full w-full" camera={{ position: [6, 1.6, 6] }} fallbackColor="#c10b0b">
            <HeroScene progressRef={progressRef} pointerRef={pointerRef} reduced={reduced} mobile={mobile} />
          </CarCanvas>
          {/* Cinematic overlays */}
          <div className="vignette pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-void via-void/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-void/80 to-transparent" />
          {/* HUD: progress rail + current chapter */}
          <div className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 sm:flex lg:right-10" aria-hidden="true">
            <span className="font-mono text-[9px] tracking-[0.2em] text-chrome [writing-mode:vertical-rl]">SCROLL</span>
            <div className="relative h-40 w-px bg-white/15">
              <div ref={rail} className="absolute inset-0 origin-top scale-y-0 bg-racing" />
            </div>
          </div>
          <p ref={chapterLabel} className="pointer-events-none absolute bottom-6 right-5 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-chrome sm:block lg:right-10" aria-hidden="true">
            00 · Intro
          </p>
        </div>

        <div className="relative -mt-[100vh]">
          <HeroSection ref={hero} />
          <ScrollStory />
        </div>
      </section>

      {/* ===== Manifesto ===== */}
      <section data-manifesto className="container-v py-32 sm:py-44">
        <p className="eyebrow-red mb-10">Manifesto</p>
        <p className="max-w-5xl font-display text-2xl font-semibold uppercase leading-[1.25] tracking-tight sm:text-4xl lg:text-5xl">
          {MANIFESTO.split(' ').map((w, i) => (
            <span key={i} data-mword className="inline-block pr-[0.28em]">
              {w}
            </span>
          ))}
        </p>
      </section>

      <FeaturedCars />

      {/* ===== Final call to action ===== */}
      <section data-cta className="relative overflow-hidden py-28 sm:py-40">
        <div className="pointer-events-none select-none space-y-2" aria-hidden="true">
          <p data-cta-left className="whitespace-nowrap font-display text-[16vw] font-black uppercase leading-none tracking-tighter text-bone">
            Your build
          </p>
          <p data-cta-right className="text-outline whitespace-nowrap text-right font-display text-[16vw] font-black uppercase leading-none tracking-tighter">
            awaits you
          </p>
        </div>
        <div className="container-v mt-14 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-silver">
            Pick a paint. Choose your wheels. Dress the cabin. Watch it change in real-time 3D, then save it to your garage.
          </p>
          <Magnetic>
            <Link to="/configurator/velocity-vx1" className="btn-primary sweep" data-cursor="Build">
              Start configuring <ArrowRight size={14} />
            </Link>
          </Magnetic>
        </div>
      </section>
    </div>
  );
}
