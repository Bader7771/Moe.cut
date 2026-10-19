import { useMemo } from "react";
import SplitFlapText from "./SplitFlapText";

export default function HeroSplitFlap() {
  const words = useMemo(() => {
    const month = new Date().toLocaleString("en-US", { month: "short" }).toUpperCase();
    return [`${month}  1 SPOT OPEN`, "TAKING NEW CLIENTS", "AVAILABLE FOR WORK"];
  }, []);

  return <SplitFlapText
    className="hero-split-flap"
    cycleDelay={3800}
    flipDuration={0.1}
    flipsPerChar={6}
    fontSize={18}
    gap={4.5}
    padTo={0}
    stagger={0.035}
    textColor="#ffffff"
    tileColor="#141822"
    tileRadius={5}
    words={words}
  />;
}
