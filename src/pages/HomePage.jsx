import HeroBanner from '../components/home/HeroBanner.jsx';
import CategoryStrip from '../components/home/CategoryStrip.jsx';
import DealsSection from '../components/home/DealsSection.jsx';
import WeekendSection from '../components/home/WeekendSection.jsx';
import PromoTiles from '../components/home/PromoTiles.jsx';
import ElectronicsSection from '../components/home/ElectronicsSection.jsx';
import BrandStrip from '../components/home/BrandStrip.jsx';
import BestsellerSection from '../components/home/BestsellerSection.jsx';
import ReviewSection from '../components/home/ReviewSection.jsx';
import { useDocumentMeta } from '../hooks/useDocumentMeta.js';
import { SITE } from '../utils/constants.js';

/**
 * Homepage — route "/".
 *
 * Landmark order: banner (announcement) → banner (header) → navigation →
 * main → contentinfo, all owned by <Layout>. Sections below live inside
 * <main> in descending commercial priority.
 */
export default function HomePage() {
  useDocumentMeta(
    `${SITE.name} – ${SITE.tagline}`,
    `${SITE.name} par khojein mobiles, laptops, fashion, beauty, home appliances aur groceries. ` +
      'Best deals, fast delivery aur 100% authentic products.',
    '/'
  );

  return (
    <>
      <div className="container">
        <HeroBanner />
        <CategoryStrip />
      </div>

      <DealsSection />
      <PromoTiles />
      <WeekendSection />
      <ElectronicsSection />
      <BrandStrip />
      <BestsellerSection />
      <ReviewSection />
    </>
  );
}