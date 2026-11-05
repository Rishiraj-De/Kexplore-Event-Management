import { ArrowRight, Hand, MousePointerClick } from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useEventList } from '@/hooks/useQueries';
import { categoryById } from '@/lib/constants';
import { formatPrice, formatShortDate } from '@/lib/format';
import { imageAt } from '@/lib/utils';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Effects';
import { Kbd, SectionHeading, Skeleton } from '../ui/Misc';

// The WebGL carousel (and its `ogl` dependency) is only downloaded when this section renders.
const FlexCarousel = lazy(() => import('../reactbits/FlexCarousel'));

const supportsWebGL2 = () => {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
};

function CarouselSkeleton() {
  return (
    <div className="flex h-full items-center justify-center gap-4 overflow-hidden" aria-hidden>
      {[0.8, 1, 0.8].map((scale, i) => (
        <Skeleton key={i} className="aspect-[3/4] h-[62%] rounded-[22px]" style={{ transform: `scale(${scale})` }} />
      ))}
    </div>
  );
}

/** Plain scroll-snap fallback for browsers without WebGL 2. */
function FallbackStrip({ events }) {
  return (
    <div className="no-scrollbar flex h-full snap-x snap-mandatory items-center gap-4 overflow-x-auto px-[10vw]">
      {events.map((e) => (
        <Link key={e.id} to={`/events/${e.slug}`} className="relative aspect-[3/4] h-[70%] shrink-0 snap-center overflow-hidden rounded-[22px]">
          <img src={imageAt(e.coverImage, 700)} alt="" className="size-full object-cover" loading="lazy" />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/90 p-4 font-display text-lg font-bold text-white">{e.title}</span>
        </Link>
      ))}
    </div>
  );
}

/**
 * "The season, in motion": every upcoming event in React Bits' FlexCarousel.
 * Drag / swipe / arrow keys to browse; clicking the centred cover opens the event.
 */
export function SeasonCarousel() {
  const { data, isLoading } = useEventList({ when: 'upcoming', limit: 30 });
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [webgl] = useState(supportsWebGL2);

  const events = useMemo(() => data?.items ?? [], [data]);
  const items = useMemo(
    () =>
      events.map((e) => ({
        src: imageAt(e.coverImage, 1000),
        alt: e.title,
        title: e.title,
        subtitle: `${formatShortDate(e.startDate)} · ${e.venue?.city} · ${formatPrice(e.price)}`,
      })),
    [events],
  );
  const current = events[active] ?? events[0];
  const cat = current ? categoryById(current.category) : null;

  return (
    <section className="relative overflow-hidden py-20" aria-labelledby="season-title">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="The season, in motion"
            title={<span id="season-title">Drag through what’s coming</span>}
            description="Every upcoming event in one flowing reel. Swipe, drag or use the arrow keys — click the centre cover to open it."
          />
        </Reveal>
      </div>

      <div className="kx-flex-carousel relative mt-4 h-[clamp(440px,68vh,660px)]">
        {isLoading || !items.length ? (
          <CarouselSkeleton />
        ) : webgl ? (
          <Suspense fallback={<CarouselSkeleton />}>
            <FlexCarousel
              items={items}
              preset="liquid"
              intro="rise"
              fit="portrait"
              cardHeight={0.6}
              gap={18}
              radius={22}
              squeeze={0.18}
              focusOnClick={false}
              captureWheel={false}
              autoplay
              interval={3.5}
              onChange={(index) => setActive(index)}
              onSelect={(index) => navigate(`/events/${events[index].slug}`)}
            />
          </Suspense>
        ) : (
          <FallbackStrip events={events} />
        )}
      </div>

      <div className="container-x mt-2 flex flex-col items-center gap-4">
        {current && (
          <Button to={`/events/${current.slug}`} variant="dark" className="group max-w-full">
            {cat && <cat.icon className="size-4" style={{ color: cat.color }} />}
            <span className="truncate">Open {current.title}</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
        <p className="hidden items-center gap-4 text-xs text-muted sm:flex">
          <span className="flex items-center gap-1.5"><Hand className="size-3.5" /> Drag</span>
          <span className="flex items-center gap-1.5"><Kbd>←</Kbd><Kbd>→</Kbd> Browse</span>
          <span className="flex items-center gap-1.5"><MousePointerClick className="size-3.5" /> Click centre to open</span>
        </p>
      </div>
    </section>
  );
}
