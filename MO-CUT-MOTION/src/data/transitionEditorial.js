import frame01 from "../assets/projects/project-01.webp";
import frame02 from "../assets/projects/project-02.webp";
import frame03 from "../assets/projects/project-03.webp";
import frame04 from "../assets/projects/project-04.webp";
import frame05 from "../assets/projects/project-05.webp";
import frame06 from "../assets/projects/project-06.webp";
import frame07 from "../assets/transition-editorial/frame-07.webp";
import frame08 from "../assets/transition-editorial/frame-08.webp";
import frame09 from "../assets/transition-editorial/frame-09.webp";
import frame10 from "../assets/transition-editorial/frame-10.webp";
import frame11 from "../assets/transition-editorial/frame-11.webp";
import frame12 from "../assets/transition-editorial/frame-12.webp";

const images = [
  { src: frame01, alt: "Solitary figure beneath monumental concrete ramps", width: 2200, height: 2580, ratio: "4 / 5", position: "50% 68%" },
  { src: frame02, alt: "Motion-soft profile of a fashion model", width: 1800, height: 2574, ratio: "3 / 4", position: "58% 45%" },
  { src: frame03, alt: "Face crossed by a narrow beam of light", width: 2200, height: 1467, ratio: "3 / 2", position: "55% 50%" },
  { src: frame04, alt: "Ornate illuminated architecture beneath a night sky", width: 2200, height: 4400, ratio: "2 / 3", position: "50% 84%" },
  { src: frame05, alt: "Distant silhouettes moving through dense fog", width: 2200, height: 3300, ratio: "4 / 5", position: "50% 69%" },
  { src: frame06, alt: "Ghostlike hand hovering over a dark surface", width: 2200, height: 1469, ratio: "3 / 2", position: "40% 52%" },
  { src: frame07, alt: "Blurred fashion portrait with repeated facial movement", width: 1800, height: 2700, ratio: "3 / 4", position: "50% 43%" },
  { src: frame08, alt: "Dark profile dissolving into horizontal motion", width: 1800, height: 2700, ratio: "2 / 3", position: "52% 35%" },
  { src: frame09, alt: "Surreal double-exposure portrait covered in fine strands", width: 1800, height: 1200, ratio: "1 / 1", position: "50% 45%" },
  { src: frame10, alt: "Angular monumental building viewed from below", width: 1800, height: 1200, ratio: "16 / 9", position: "52% 57%" },
  { src: frame11, alt: "Grainy blurred silhouette crossing a bright landscape", width: 1800, height: 2700, ratio: "4 / 5", position: "53% 54%" },
  { src: frame12, alt: "Extreme close-up of palm lines emerging from shadow", width: 1800, height: 2700, ratio: "2 / 3", position: "39% 48%" },
].map((image, index) => ({
  ...image,
  id: `frame-${String(index + 1).padStart(2, "0")}`,
  eager: index < 4,
  mobile: ![2, 5, 8, 11].includes(index),
  displayHeight: [0.76, 0.68, 0.62, 0.72, 0.66, 0.64, 0.82, 0.7, 0.88, 0.65, 0.74, 0.68][index],
}));

const text = (value) => ({ type: "text", value });
const image = (index) => ({ type: "image", ...images[index] });

export const transitionEditorialTracks = [
  [text("FASHION FILMS,"), image(0), text("MUSIC VIDEOS,"), image(6), text("BRAND STORIES,"), image(2), text("SHORT FILMS,")],
  [text("COMMERCIALS,"), image(3), text("DOCUMENTARIES,"), image(4), text("SOCIAL CUTS,"), image(9), text("SOUND DESIGN, CAMPAIGNS,")],
  [text("EDITING, RHYTHM,"), image(1), text("COLOR,"), image(8), text("SOUND, MOVEMENT,"), image(10), text("MEMORY, FRAME BY FRAME")],
  [text("VISUAL STORIES,"), image(7), text("CAMPAIGNS,"), image(5), text("EDITING, MOVEMENT,"), image(11), text("CUT AFTER CUT")],
];
