/**
 * Homepage — "One night, told in acts."
 * Acts are rendered in sequence; scroll = time.
 */

import { ActHero } from "@/components/sections/ActHero";
import { ActManifesto } from "@/components/sections/ActManifesto";
import { ActFounder } from "@/components/sections/ActFounder";
import { ActNights } from "@/components/sections/ActNights";
import { ActMoments } from "@/components/sections/ActMoments";
import { ActNextChapter } from "@/components/sections/ActNextChapter";
import { ActInvitation } from "@/components/sections/ActInvitation";
import { SiteFooter } from "@/components/sections/SiteFooter";

export default function Home() {
  return (
    <main id="main-content" aria-label="TheVMEx — Premium Event Experiences">
      <ActHero />
      <ActManifesto />
      <ActFounder />
      <ActNights />
      <ActMoments />
      <ActNextChapter />
      <ActInvitation />
      <SiteFooter />
    </main>
  );
}
