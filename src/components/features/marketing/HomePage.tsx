import { HomeAbout } from "@/components/features/marketing/HomeAbout";
import { HomeCta } from "@/components/features/marketing/HomeCta";
import { HomeHero } from "@/components/features/marketing/HomeHero";

export function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeAbout />
      <HomeCta />
    </>
  );
}
