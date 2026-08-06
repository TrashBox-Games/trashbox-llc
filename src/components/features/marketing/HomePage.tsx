import { HomeAbout } from "@/components/features/marketing/HomeAbout";
import { HomeCta } from "@/components/features/marketing/HomeCta";
import { HomeHero } from "@/components/features/marketing/HomeHero";
import { HomeScrollShowcase } from "@/components/features/marketing/HomeScrollShowcase";
import { HomeStatement } from "@/components/features/marketing/HomeStatement";

export function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeAbout />
      <HomeScrollShowcase />
      <HomeStatement />
      <HomeCta />
    </>
  );
}
