'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { pauseDuration } from '~/constants';
import { OrchestratedReveal } from './reveal';
import { useRef } from 'react';
import Link from 'next/link';
import { Icon } from './icon';
import Image from 'next/image';
import { OrchestratedLineReveal } from './line-reveal';

const MotionImage = motion(Image);

export function Hero() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['end end', 'end start'],
	});
	const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

	return (
		<section
			ref={containerRef}
			data-header-dark
			className="-mx-8 flex h-[calc(100svh+4rem)] flex-col justify-end gap-4 bg-gray-900 px-8 pb-32 text-gray-50 sm:flex-row sm:items-end sm:justify-between md:-mx-16 md:px-16"
		>
			<div className="absolute inset-x-0 top-0 h-[calc(100svh+4rem)] overflow-hidden">
				<motion.div style={{ scale }} className="h-full w-full">
					<MotionImage
						src="/hero.png"
						alt="A dramatic view of a beach covered in palm trees destroyed by a hurricane."
						fill
						className="absolute origin-top object-cover object-center"
						initial={{ scale: 1.25 }}
						animate={{ scale: 1.0 }}
						transition={{
							type: 'spring',
							duration: 3,
							bounce: 0,
							delay: pauseDuration,
						}}
					/>
				</motion.div>

				<div className="absolute inset-0 block from-gray-900 bg-radial-gradient gradient-bottom-left" />

				<div className="absolute inset-x-0 bottom-0 h-16	bg-gradient-to-t from-gray-100"></div>

				<div className="absolute inset-x-0 bottom-0 h-64 from-black mask-gradient-to-t">
					<div className="h-full from-transparent to-black radial-farthest-side gradient-top mask-radial-gradient">
						<div className="h-full bg-gray-100 mask-cover mask-luminance mask-center mask-[url(/painted-mask.png)]"></div>
					</div>
				</div>
			</div>

			<div className="relative space-y-4">
				<h1 className="font-display text-4xl uppercase xs:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl">
					<OrchestratedLineReveal
						delay={pauseDuration + 0.5}
						lines={[
							'Mapping Hurricane',
							'Hazards, Survivals',
							'and Repair in Dominica',
						]}
					/>
				</h1>
				<OrchestratedReveal
					delay={pauseDuration + 0.8}
					className="h-1 w-64 rounded-sm bg-yellow-500"
				/>
				<OrchestratedReveal
					delay={pauseDuration + 0.9}
					className="flex items-center gap-2"
				>
					<p className="font-semibold">Scroll Down to Explore</p>
					<div
						aria-hidden
						className="h-5 w-4 rounded-full border-2 border-current before:mx-auto before:mt-[3px] before:block before:h-1 before:w-0.5 before:rounded-sm before:bg-current"
					/>
				</OrchestratedReveal>
			</div>

			<OrchestratedReveal
				delay={pauseDuration + 1}
				className="relative flex h-10 w-fit items-center overflow-hidden rounded-full bg-white text-gray-700 ring-1 ring-gray-500/50"
			>
				<Link
					href="https://www.instagram.com/cccproject767/"
					title="Follow Us on Instagram"
					className="flex h-10 pl-3 pr-2 hover:bg-gray-200 active:bg-gray-300"
				>
					<span className="sr-only">Follow Us on Instagram</span>
					<Icon name="instagram" className="m-auto w-6" />
				</Link>
				<div className="h-full w-px bg-gray-500/50" />
				<Link
					href="https://twitter.com/CCCproject767"
					title="Follow Us on Twitter"
					className="flex h-10 pl-2 pr-3 hover:bg-gray-200 active:bg-gray-300"
				>
					<span className="sr-only">Follow Us on Twitter</span>
					<Icon name="twitter" className="m-auto w-6" />
				</Link>
			</OrchestratedReveal>
		</section>
	);
}
