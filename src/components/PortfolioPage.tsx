import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { MotionProvider } from "./forge/MotionProvider";
import { Hero } from "./home/Hero";
import { Process } from "./home/Process";
import { Works } from "./home/Works";
import { Capabilities } from "./home/Capabilities";
import { Experience } from "./home/Experience";
import { Commission } from "./home/Commission";

/** The homepage: sections in order. Content shape lives in home/data.ts. */
export function PortfolioPage() {
  return (
    <MotionProvider>
      <SiteHeader />
      <main id="top">
        <Hero />
        <Process />
        <Works />
        <Capabilities />
        <Experience />
        <Commission />
      </main>
      <SiteFooter />
    </MotionProvider>
  );
}
