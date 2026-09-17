import { PortfolioPage } from "@/components/PortfolioPage";
import { TrackView } from "@/components/TrackView";

export default function Home() {
  return (
    <>
      <TrackView path="/" />
      <PortfolioPage />
    </>
  );
}
