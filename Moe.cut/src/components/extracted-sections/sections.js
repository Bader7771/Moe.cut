// Imported from the supplied Desktop/extracted-sections section.
// The email form validates locally only; it does not send or store submissions.
import { useEffect, useRef, useState } from "react";
import "./sections.css";
import frame01 from "../../assets/projects/project-01.webp";
import frame02 from "../../assets/projects/project-02.webp";
import frame03 from "../../assets/projects/project-03.webp";
import frame04 from "../../assets/projects/project-04.webp";
import frame05 from "../../assets/projects/project-05.webp";
import frame06 from "../../assets/projects/project-06.webp";
import frame07 from "../../assets/transition-editorial/frame-07.webp";
import frame08 from "../../assets/transition-editorial/frame-08.webp";
import frame09 from "../../assets/transition-editorial/frame-09.webp";
import frame10 from "../../assets/transition-editorial/frame-10.webp";
import frame11 from "../../assets/transition-editorial/frame-11.webp";
import frame12 from "../../assets/transition-editorial/frame-12.webp";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const images = [
	{
		src: frame01,
		alt: "Solitary figure beneath monumental concrete ramps",
		width: 2200,
		height: 2580,
		ratio: "4 / 5",
		position: "50% 68%"
	},
	{
		src: frame02,
		alt: "Motion-soft profile of a fashion model",
		width: 1800,
		height: 2574,
		ratio: "3 / 4",
		position: "58% 45%"
	},
	{
		src: frame03,
		alt: "Face crossed by a narrow beam of light",
		width: 2200,
		height: 1467,
		ratio: "3 / 2",
		position: "55% 50%"
	},
	{
		src: frame04,
		alt: "Ornate illuminated architecture beneath a night sky",
		width: 2200,
		height: 4400,
		ratio: "2 / 3",
		position: "50% 84%"
	},
	{
		src: frame05,
		alt: "Distant silhouettes moving through dense fog",
		width: 2200,
		height: 3300,
		ratio: "4 / 5",
		position: "50% 69%"
	},
	{
		src: frame06,
		alt: "Ghostlike hand hovering over a dark surface",
		width: 2200,
		height: 1469,
		ratio: "3 / 2",
		position: "40% 52%"
	},
	{
		src: frame07,
		alt: "Blurred fashion portrait with repeated facial movement",
		width: 1800,
		height: 2700,
		ratio: "3 / 4",
		position: "50% 43%"
	},
	{
		src: frame08,
		alt: "Dark profile dissolving into horizontal motion",
		width: 1800,
		height: 2700,
		ratio: "2 / 3",
		position: "52% 35%"
	},
	{
		src: frame09,
		alt: "Surreal double-exposure portrait covered in fine strands",
		width: 1800,
		height: 1200,
		ratio: "1 / 1",
		position: "50% 45%"
	},
	{
		src: frame10,
		alt: "Angular monumental building viewed from below",
		width: 1800,
		height: 1200,
		ratio: "16 / 9",
		position: "52% 57%"
	},
	{
		src: frame11,
		alt: "Grainy blurred silhouette crossing a bright landscape",
		width: 1800,
		height: 2700,
		ratio: "4 / 5",
		position: "53% 54%"
	},
	{
		src: frame12,
		alt: "Extreme close-up of palm lines emerging from shadow",
		width: 1800,
		height: 2700,
		ratio: "2 / 3",
		position: "39% 48%"
	}
].map((image, index) => ({
	...image,
	id: `frame-${String(index + 1).padStart(2, "0")}`,
	eager: index < 4,
	mobile: ![
		2,
		5,
		8,
		11
	].includes(index),
	displayHeight: [
		.76,
		.68,
		.62,
		.72,
		.66,
		.64,
		.82,
		.7,
		.88,
		.65,
		.74,
		.68
	][index]
}));
const text = (value) => ({
	type: "text",
	value
});
const image = (index) => ({
	type: "image",
	...images[index]
});
export const transitionEditorialTracks = [
	[
		text("FASHION FILMS,"),
		image(0),
		text("MUSIC VIDEOS,"),
		image(6),
		text("BRAND STORIES,"),
		image(2),
		text("SHORT FILMS,")
	],
	[
		text("COMMERCIALS,"),
		image(3),
		text("DOCUMENTARIES,"),
		image(4),
		text("SOCIAL CUTS,"),
		image(9),
		text("SOUND DESIGN, CAMPAIGNS,")
	],
	[
		text("EDITING, RHYTHM,"),
		image(1),
		text("COLOR,"),
		image(8),
		text("SOUND, MOVEMENT,"),
		image(10),
		text("MEMORY, FRAME BY FRAME")
	],
	[
		text("VISUAL STORIES,"),
		image(7),
		text("CAMPAIGNS,"),
		image(5),
		text("EDITING, MOVEMENT,"),
		image(11),
		text("CUT AFTER CUT")
	]
];
const clamp = (value) => Math.max(0, Math.min(1, value));
const START_SCALE = .05;
const TEXT_EXIT_START = .02;
const TEXT_EXIT_SPAN = .16;
const BUTTON_REVEAL_START = TEXT_EXIT_START + TEXT_EXIT_SPAN;
const MAX_DAMAGE = 5;
const cracks = [
	{
		level: 1,
		left: 48,
		top: 8,
		length: 18,
		angle: 73
	},
	{
		level: 1,
		left: 55,
		top: 25,
		length: 13,
		angle: 142
	},
	{
		level: 2,
		left: 43,
		top: 31,
		length: 20,
		angle: 42
	},
	{
		level: 2,
		left: 58,
		top: 39,
		length: 16,
		angle: 102
	},
	{
		level: 2,
		left: 38,
		top: 47,
		length: 12,
		angle: 168
	},
	{
		level: 3,
		left: 44,
		top: 52,
		length: 22,
		angle: 61
	},
	{
		level: 3,
		left: 59,
		top: 58,
		length: 17,
		angle: 15
	},
	{
		level: 3,
		left: 33,
		top: 58,
		length: 16,
		angle: 126
	},
	{
		level: 4,
		left: 51,
		top: 67,
		length: 21,
		angle: 91
	},
	{
		level: 4,
		left: 26,
		top: 43,
		length: 14,
		angle: 205
	},
	{
		level: 4,
		left: 68,
		top: 48,
		length: 15,
		angle: -28
	},
	{
		level: 4,
		left: 46,
		top: 76,
		length: 12,
		angle: 151
	}
];
const fragments = [
	{
		level: 2,
		left: 18,
		top: 18,
		width: 5,
		height: 4,
		x: -25,
		y: -18,
		rotate: -40,
		dark: false
	},
	{
		level: 2,
		left: 76,
		top: 26,
		width: 4,
		height: 6,
		x: 25,
		y: -13,
		rotate: 54,
		dark: true
	},
	{
		level: 2,
		left: 28,
		top: 77,
		width: 6,
		height: 3,
		x: -22,
		y: 20,
		rotate: -72,
		dark: false
	},
	{
		level: 3,
		left: 66,
		top: 72,
		width: 5,
		height: 5,
		x: 24,
		y: 22,
		rotate: 86,
		dark: false
	},
	{
		level: 3,
		left: 12,
		top: 52,
		width: 3,
		height: 6,
		x: -31,
		y: 4,
		rotate: 38,
		dark: true
	},
	{
		level: 3,
		left: 84,
		top: 56,
		width: 5,
		height: 3,
		x: 34,
		y: 7,
		rotate: -48,
		dark: false
	},
	{
		level: 3,
		left: 51,
		top: 12,
		width: 4,
		height: 4,
		x: 4,
		y: -29,
		rotate: 110,
		dark: true
	},
	{
		level: 4,
		left: 37,
		top: 24,
		width: 7,
		height: 4,
		x: -16,
		y: -30,
		rotate: -96,
		dark: false
	},
	{
		level: 4,
		left: 71,
		top: 42,
		width: 4,
		height: 7,
		x: 31,
		y: -5,
		rotate: 67,
		dark: true
	},
	{
		level: 4,
		left: 48,
		top: 83,
		width: 6,
		height: 4,
		x: 2,
		y: 34,
		rotate: 124,
		dark: false
	},
	{
		level: 4,
		left: 22,
		top: 64,
		width: 4,
		height: 5,
		x: -33,
		y: 18,
		rotate: -118,
		dark: true
	},
	{
		level: 5,
		left: 8,
		top: 24,
		width: 8,
		height: 7,
		x: -58,
		y: -34,
		rotate: -160,
		dark: false
	},
	{
		level: 5,
		left: 79,
		top: 10,
		width: 7,
		height: 9,
		x: 55,
		y: -49,
		rotate: 145,
		dark: false
	},
	{
		level: 5,
		left: 84,
		top: 74,
		width: 8,
		height: 6,
		x: 61,
		y: 47,
		rotate: 190,
		dark: true
	},
	{
		level: 5,
		left: 12,
		top: 82,
		width: 7,
		height: 8,
		x: -53,
		y: 52,
		rotate: -134,
		dark: false
	},
	{
		level: 5,
		left: 44,
		top: 4,
		width: 9,
		height: 6,
		x: -4,
		y: -61,
		rotate: 220,
		dark: true
	},
	{
		level: 5,
		left: 48,
		top: 88,
		width: 8,
		height: 7,
		x: 5,
		y: 64,
		rotate: -210,
		dark: false
	},
	{
		level: 5,
		left: 3,
		top: 52,
		width: 6,
		height: 10,
		x: -67,
		y: 2,
		rotate: 175,
		dark: true
	},
	{
		level: 5,
		left: 89,
		top: 48,
		width: 7,
		height: 9,
		x: 69,
		y: -2,
		rotate: -185,
		dark: false
	}
];
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function ScrollScaleButton() {
	const slot = useRef(null);
	const prompt = useRef(null);
	const label = useRef(null);
	const impact = useRef(null);
	const emailInput = useRef(null);
	const completed = useRef(false);
	const revealTimer = useRef(0);
	const [damage, setDamage] = useState(0);
	const [shattered, setShattered] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [email, setEmail] = useState("");
	const [formState, setFormState] = useState("idle");
	useEffect(() => {
		const slotNode = slot.current;
		const promptNode = prompt.current;
		const labelNode = label.current;
		const sectionNode = slotNode?.closest(".extracted-editorial-scroll");
		const textStage = sectionNode?.querySelector(".extracted-editorial-type-stage");
		if (!slotNode || !promptNode || !labelNode || !sectionNode || !textStage) {
			return undefined;
		}
		let animationFrame = 0;
		const updateScale = () => {
			animationFrame = 0;
			if (completed.current) {
				slotNode.style.opacity = "1";
				slotNode.style.visibility = "visible";
				promptNode.style.transform = "scale(1)";
				labelNode.style.opacity = "1";
				labelNode.style.transform = "translateY(0)";
				return;
			}
			const rect = sectionNode.getBoundingClientRect();
			const scrollDistance = Math.max(1, sectionNode.offsetHeight - innerHeight);
			const sectionProgress = clamp(-rect.top / scrollDistance);
			const textIsFinished = getComputedStyle(textStage).visibility === "hidden";
			const buttonProgress = textIsFinished ? clamp((sectionProgress - BUTTON_REVEAL_START) / (1 - BUTTON_REVEAL_START)) : 0;
			const scale = START_SCALE + (1 - START_SCALE) * buttonProgress;
			slotNode.style.opacity = buttonProgress;
			slotNode.style.visibility = buttonProgress > 0 ? "visible" : "hidden";
			slotNode.style.setProperty("--button-reveal", buttonProgress);
			promptNode.style.transform = `scale(${scale})`;
			labelNode.style.opacity = clamp(buttonProgress * 1.35);
			labelNode.style.transform = `translateY(${(1 - buttonProgress) * 8}px)`;
		};
		const scheduleUpdate = () => {
			if (!animationFrame) animationFrame = requestAnimationFrame(updateScale);
		};
		addEventListener("scroll", scheduleUpdate, { passive: true });
		addEventListener("resize", scheduleUpdate);
		updateScale();
		return () => {
			cancelAnimationFrame(animationFrame);
			removeEventListener("scroll", scheduleUpdate);
			removeEventListener("resize", scheduleUpdate);
		};
	}, []);
	useEffect(() => () => clearTimeout(revealTimer.current), []);
	useEffect(() => {
		if (!showForm) return undefined;
		const focusFrame = requestAnimationFrame(() => emailInput.current?.focus());
		return () => cancelAnimationFrame(focusFrame);
	}, [showForm]);
	const handleBreak = () => {
		if (shattered) return;
		const nextDamage = Math.min(damage + 1, MAX_DAMAGE);
		setDamage(nextDamage);
		const strength = 1 + nextDamage * .55;
		impact.current?.animate([
			{ transform: "translate3d(0, 0, 0) rotate(0deg)" },
			{ transform: `translate3d(${-strength}px, ${strength * .35}px, 0) rotate(${-strength * .35}deg)` },
			{ transform: `translate3d(${strength}px, ${-strength * .25}px, 0) rotate(${strength * .25}deg)` },
			{ transform: `translate3d(${-strength * .45}px, 0, 0) rotate(${-strength * .12}deg)` },
			{ transform: "translate3d(0, 0, 0) rotate(0deg)" }
		], {
			duration: 150 + nextDamage * 28,
			easing: "cubic-bezier(0.2, 0.75, 0.25, 1)"
		});
		if (nextDamage === MAX_DAMAGE) {
			completed.current = true;
			if (slot.current) {
				slot.current.style.opacity = "1";
				slot.current.style.visibility = "visible";
			}
			setShattered(true);
			revealTimer.current = setTimeout(() => setShowForm(true), 760);
		}
	};
	const handleSubmit = (event) => {
		event.preventDefault();
		const normalizedEmail = email.trim();
		if (!isValidEmail(normalizedEmail)) {
			setFormState("error");
			return;
		}
		setFormState("success");
	};
	const remainingHits = MAX_DAMAGE - damage;
	return /* @__PURE__ */ _jsxs("div", {
		ref: slot,
		className: `extracted-scroll-button-slot${showForm ? " is-form-visible" : ""}`,
		children: [/* @__PURE__ */ _jsxs("div", {
			ref: prompt,
			className: `extracted-box-prompt${shattered ? " extracted-is-shattering" : ""}${showForm ? " extracted-is-complete" : ""}`,
			children: [/* @__PURE__ */ _jsx("p", {
				ref: label,
				className: "extracted-box-instruction",
				children: "CLICK ON THE BOX"
			}), /* @__PURE__ */ _jsxs("div", {
				className: "extracted-scroll-button-layout",
				children: [/* @__PURE__ */ _jsx("div", {
					className: "extracted-box-size-shell",
					children: /* @__PURE__ */ _jsx("div", {
						ref: impact,
						className: "extracted-box-impact-shell",
						children: /* @__PURE__ */ _jsxs("div", {
							className: `extracted-scroll-scale-button${shattered ? " extracted-is-shattered" : ""}`,
							"data-damage": damage,
							children: [
								/* @__PURE__ */ _jsx("button", {
									name: "break-box",
									type: "button",
									"aria-label": shattered ? "Box broken" : `Break the box. ${remainingHits} ${remainingHits === 1 ? "hit" : "hits"} remaining`,
									disabled: shattered,
									onClick: handleBreak
								}),
								/* @__PURE__ */ _jsx("span", {}),
								/* @__PURE__ */ _jsx("span", {}),
								/* @__PURE__ */ _jsx("span", {}),
								/* @__PURE__ */ _jsx("span", {}),
								/* @__PURE__ */ _jsx("span", {
									className: "extracted-box-cracks",
									"aria-hidden": "true",
									children: cracks.filter((crack) => crack.level <= damage).map((crack, index) => /* @__PURE__ */ _jsx("i", { style: {
										"--crack-left": `${crack.left}%`,
										"--crack-top": `${crack.top}%`,
										"--crack-length": `${crack.length}px`,
										"--crack-angle": `${crack.angle}deg`
									} }, `${crack.level}-${index}`))
								})
							]
						})
					})
				}), /* @__PURE__ */ _jsx("span", {
					className: `extracted-box-fragments${shattered ? " is-final" : ""}`,
					"aria-hidden": "true",
					children: fragments.filter((fragment) => fragment.level <= damage).map((fragment, index) => {
						const finalFragment = fragment.level === MAX_DAMAGE;
						const travel = finalFragment ? 1 : .46 + damage * .08;
						return /* @__PURE__ */ _jsx("i", {
							className: fragment.dark ? "extracted-is-dark" : "",
							style: {
								"--fragment-left": `${fragment.left}%`,
								"--fragment-top": `${fragment.top}%`,
								"--fragment-width": `${fragment.width}px`,
								"--fragment-height": `${fragment.height}px`,
								"--fragment-x": `${fragment.x * travel}px`,
								"--fragment-y": `${fragment.y * travel}px`,
								"--fragment-rotate": `${fragment.rotate * travel}deg`,
								"--fragment-delay": `${index % 4 * 16}ms`
							}
						}, `${damage}-${fragment.level}-${index}`);
					})
				})]
			})]
		}), /* @__PURE__ */ _jsx("div", {
			className: `extracted-contact-panel${showForm ? " extracted-is-visible" : ""}`,
			children: formState === "success" ? /* @__PURE__ */ _jsx("p", {
				className: "extracted-contact-success",
				role: "status",
				children: "THANK YOU — WE'LL BE IN TOUCH."
			}) : /* @__PURE__ */ _jsxs("form", {
				className: "extracted-contact-form",
				noValidate: true,
				onSubmit: handleSubmit,
				children: [
					/* @__PURE__ */ _jsx("label", {
						htmlFor: "contact-email",
						children: "LET'S STAY IN TOUCH"
					}),
					/* @__PURE__ */ _jsxs("div", {
						className: `extracted-contact-field${formState === "error" ? " extracted-has-error" : ""}`,
						children: [/* @__PURE__ */ _jsx("input", {
							ref: emailInput,
							id: "contact-email",
							name: "email",
							type: "email",
							inputMode: "email",
							autoComplete: "email",
							placeholder: "your email",
							value: email,
							onChange: (event) => {
								setEmail(event.target.value);
								if (formState === "error") setFormState("idle");
							},
							"aria-invalid": formState === "error",
							"aria-describedby": "contact-email-message"
						}), /* @__PURE__ */ _jsx("button", {
							type: "submit",
							"aria-label": "Submit email",
							children: "→"
						})]
					}),
					/* @__PURE__ */ _jsx("p", {
						id: "contact-email-message",
						className: "extracted-contact-message",
						"aria-live": "polite",
						children: formState === "error" ? "PLEASE ENTER A VALID EMAIL" : "\xA0"
					})
				]
			})
		})]
	});
}
const trackNames = [
	"one",
	"two",
	"three",
	"four"
];
export default function EditorialProjects() {
	const wrapper = useRef(null);
	const poster = useRef(null);
	const tracks = useRef([]);
	useEffect(() => {
		const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
		let frame = 0;
		const update = () => {
			frame = 0;
			const node = wrapper.current;
			const page = poster.current;
			if (!node || !page) return;
			const rect = node.getBoundingClientRect();
			const distance = Math.max(1, node.offsetHeight - innerHeight);
			const progress = clamp(-rect.top / distance);
			const transition = clamp(1 - rect.top / innerHeight);
			const ease = (value) => value * value * (3 - 2 * value);
			const stageExit = ease(reducedMotion ? clamp((transition - .72) / .2) : clamp((progress - .02) / .16));
			page.style.setProperty("--type-stage-o", 1 - stageExit);
			page.style.setProperty("--type-stage-y", `${reducedMotion ? 0 : stageExit * -120}px`);
			page.style.setProperty("--type-stage-scale", 1 - stageExit * .015);
			page.style.setProperty("--type-stage-clip", `${stageExit * 100}%`);
			page.style.setProperty("--type-stage-visibility", stageExit >= .999 ? "hidden" : "visible");
			const rowSpecs = innerWidth <= 700 ? [
				{
					enter: .04,
					startX: 5,
					endX: -7,
					pinnedX: -2
				},
				{
					enter: .1,
					startX: -6,
					endX: 5,
					pinnedX: 2
				},
				{
					enter: .16,
					startX: 4,
					endX: -6,
					pinnedX: -2
				},
				{
					enter: .22,
					startX: -5,
					endX: 4,
					pinnedX: 2
				}
			] : [
				{
					enter: .04,
					startX: 8,
					endX: -6,
					pinnedX: -6
				},
				{
					enter: .1,
					startX: -12,
					endX: 4,
					pinnedX: 6
				},
				{
					enter: .16,
					startX: 5,
					endX: -4,
					pinnedX: -4
				},
				{
					enter: .22,
					startX: -6,
					endX: 3,
					pinnedX: 4
				}
			];
			rowSpecs.forEach((spec, index) => {
				const incoming = ease(clamp((transition - spec.enter) / .2));
				const horizontalProgress = ease(transition);
				const handoffProgress = ease(clamp(progress / .2));
				const x = reducedMotion ? 0 : spec.startX + (spec.endX - spec.startX) * horizontalProgress + spec.pinnedX * handoffProgress;
				page.style.setProperty(`--track-${index + 1}-x`, `${x}vw`);
				page.style.setProperty(`--track-${index + 1}-y`, `${reducedMotion ? 0 : (1 - incoming) * 50}px`);
				page.style.setProperty(`--track-${index + 1}-o`, incoming);
				page.style.setProperty(`--track-${index + 1}-clip`, `${reducedMotion ? 0 : (1 - incoming) * 100}%`);
				tracks.current[index]?.querySelectorAll(".extracted-inline-editorial-media").forEach((media, mediaIndex) => {
					const reveal = reducedMotion ? 1 : ease(clamp((incoming - mediaIndex * .1) / .7));
					const drift = reducedMotion ? 0 : (horizontalProgress - .5) * (mediaIndex % 2 ? -18 : 18);
					media.style.setProperty("--inline-reveal", reveal);
					media.style.setProperty("--inline-clip", `${(1 - reveal) * 100}%`);
					media.style.setProperty("--inline-scale", .88 + reveal * .12);
					media.style.setProperty("--inline-drift", `${drift}px`);
				});
			});
			if (reducedMotion) {
				const collage = ease(clamp((transition - .92) / .08));
				page.style.setProperty("--title-y", `${(1 - collage) * 24}px`);
				page.style.setProperty("--title-o", collage);
				page.style.setProperty("--one-y", `${(1 - collage) * 24}px`);
				page.style.setProperty("--one-clip", `${(1 - collage) * 100}%`);
				page.style.setProperty("--one-o", collage);
				page.style.setProperty("--two-y", `${(1 - collage) * 24}px`);
				page.style.setProperty("--two-clip", `${(1 - collage) * 100}%`);
				page.style.setProperty("--two-o", collage);
				page.style.setProperty("--three-x", "0px");
				page.style.setProperty("--three-y", `${(1 - collage) * 24}px`);
				page.style.setProperty("--three-scale", 1);
				page.style.setProperty("--three-o", collage);
				page.style.setProperty("--detail-o", collage);
				page.style.setProperty("--marker-scale", collage);
				return;
			}
			const title = clamp(progress / .2);
			const one = clamp((progress - .1) / .24);
			const two = clamp((progress - .28) / .25);
			const three = clamp((progress - .46) / .28);
			const details = clamp((progress - .68) / .2);
			page.style.setProperty("--title-y", `${(1 - title) * 50}px`);
			page.style.setProperty("--title-o", title);
			page.style.setProperty("--one-y", `${(1 - one) * 78 - progress * 36}px`);
			page.style.setProperty("--one-clip", `${(1 - one) * 100}%`);
			page.style.setProperty("--one-o", one);
			page.style.setProperty("--two-y", `${(1 - two) * 92 - progress * 18}px`);
			page.style.setProperty("--two-clip", `${(1 - two) * 100}%`);
			page.style.setProperty("--two-o", two);
			page.style.setProperty("--three-x", `${(1 - three) * 34 + progress * 12}px`);
			page.style.setProperty("--three-y", `${(1 - three) * 70 - progress * 28}px`);
			page.style.setProperty("--three-scale", .94 + three * .06);
			page.style.setProperty("--three-o", three);
			page.style.setProperty("--detail-o", details);
			page.style.setProperty("--marker-scale", details);
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		addEventListener("scroll", schedule, { passive: true });
		addEventListener("resize", schedule);
		update();
		return () => {
			cancelAnimationFrame(frame);
			removeEventListener("scroll", schedule);
			removeEventListener("resize", schedule);
		};
	}, []);
	return /* @__PURE__ */ _jsx("div", {
		ref: wrapper,
		className: "extracted-editorial-scroll",
		children: /* @__PURE__ */ _jsxs("section", {
			ref: poster,
			className: "extracted-editorial",
			"aria-label": "Editorial transition",
			children: [/* @__PURE__ */ _jsx("div", {
				className: "extracted-editorial-type-stage",
				"aria-hidden": "true",
				children: transitionEditorialTracks.map((track, trackIndex) => /* @__PURE__ */ _jsx("div", {
					className: `extracted-editorial-track track-${trackIndex + 1} extracted-track-${trackNames[trackIndex]}`,
					ref: (node) => {
						tracks.current[trackIndex] = node;
					},
					children: /* @__PURE__ */ _jsx("div", {
						className: "extracted-type-track-inner",
						children: track.map((item, itemIndex) => item.type === "text" ? /* @__PURE__ */ _jsx("span", { children: item.value }, `${item.value}-${itemIndex}`) : /* @__PURE__ */ _jsx("span", {
							className: `extracted-inline-editorial-media${item.mobile ? "" : " extracted-mobile-hide"}`,
							style: {
								"--inline-ratio": item.ratio,
								"--inline-position": item.position,
								"--inline-height": `${item.displayHeight}em`
							},
							children: /* @__PURE__ */ _jsx("img", {
								src: item.src,
								alt: item.alt,
								loading: item.eager ? "eager" : "lazy",
								fetchPriority: item.eager ? "high" : "auto",
								width: item.width,
								height: item.height
							})
						}, item.id))
					})
				}, trackIndex))
			}), /* @__PURE__ */ _jsx(ScrollScaleButton, {})]
		})
	});
}
