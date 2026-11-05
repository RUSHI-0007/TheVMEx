/**
 * GSAP plugin registration — imported once at the app root.
 * All plugins are free-tier GSAP: ScrollTrigger, SplitText, Flip,
 * Observer, Draggable, InertiaPlugin, CustomEase, ScrambleText.
 * CustomEase "vm" is registered here as the primary reveal curve.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { CustomEase } from "gsap/CustomEase";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

let registered = false;

export function registerGSAP() {
  if (registered || typeof window === "undefined") return;
  registered = true;

  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    Flip,
    Observer,
    Draggable,
    InertiaPlugin,
    CustomEase,
    ScrambleTextPlugin,
  );

  // Primary reveal ease: snappy deceleration with a slight overshoot feel
  CustomEase.create("vm", "M0,0 C0.16,1 0.3,1 1,1");

  // Smooth lag handling — critical for the single-clock architecture
  gsap.ticker.lagSmoothing(0);
}

export {
  gsap,
  ScrollTrigger,
  SplitText,
  Flip,
  Observer,
  Draggable,
  InertiaPlugin,
  CustomEase,
  ScrambleTextPlugin,
};

