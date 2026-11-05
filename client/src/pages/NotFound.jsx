import { ArrowLeft, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Aurora } from '@/components/ui/Effects';

export default function NotFound({ title = 'This page wandered off' }) {
  return (
    <section className="relative isolate grid min-h-[90vh] place-items-center overflow-hidden px-4 pt-24 text-center">
      <title>Not found · Kexplore</title>
      <Aurora />
      <div>
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-gradient animate-gradient-pan font-display text-[38vw] font-extrabold leading-none tracking-tighter sm:text-[16rem]"
        >
          404
        </motion.p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">The link might be broken or the event may have been removed. Let’s get you somewhere fun.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/events">
            <Compass className="size-4" /> Explore events
          </Button>
          <Button to="/" variant="outline">
            <ArrowLeft className="size-4" /> Home
          </Button>
        </div>
      </div>
    </section>
  );
}
