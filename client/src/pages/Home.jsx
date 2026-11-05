import { Hero } from '@/components/home/Hero';
import { CategoryGrid, FeaturedBento, HostCta, HowItWorks, MarqueeBand, SocialProof, UpcomingSection } from '@/components/home/Sections';

export default function Home() {
  return (
    <>
      <title>Kexplore — Discover & register for events you’ll remember</title>
      <Hero />
      <MarqueeBand />
      <FeaturedBento />
      <UpcomingSection />
      <CategoryGrid />
      <HowItWorks />
      <SocialProof />
      <HostCta />
    </>
  );
}
