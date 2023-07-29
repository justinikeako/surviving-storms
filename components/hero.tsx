'use client';

import { motion } from 'framer-motion';
import { pauseDuration } from '~/constants';
import { OrchestratedReveal } from './reveal';
import Link from 'next/link';
import { Icon } from './icon';
import Image from 'next/image';

const MotionImage = motion(Image);

export function Hero() {
	return (
		<section
			data-transparent-header
			className="-mx-16 flex h-screen flex-col justify-end gap-4 bg-gray-900 p-16 text-gray-50 sm:flex-row sm:items-end sm:justify-between"
		>
			<div className="absolute inset-x-0 top-0 h-screen overflow-hidden after:absolute after:inset-0 after:block after:from-gray-900 after:gradient-bottom-left after:bg-radial-gradient">
				<MotionImage
					src="/hero.png"
					alt="A dramatic view of a beach covered in palm trees destroyed by a hurricane."
					fill
					className="origin-top object-cover object-center"
					initial={{ scale: 1.2 }}
					animate={{ scale: 1.1 }}
					transition={{
						type: 'spring',
						duration: 2,
						bounce: 0,
						delay: pauseDuration,
					}}
				/>
			</div>

			<div className="relative space-y-4">
				<h1 className="font-display text-4xl uppercase xs:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl">
					<span className="block overflow-hidden">
						<motion.span
							initial={{ y: '100%' }}
							animate={{ y: '0%' }}
							transition={{
								type: 'spring',
								duration: 1,
								bounce: 0,
								delay: pauseDuration + 0.5,
							}}
							className="inline-block"
						>
							Mapping Hurricane
						</motion.span>
					</span>
					<span className="block overflow-hidden">
						<motion.span
							initial={{ y: '100%' }}
							animate={{ y: '0%' }}
							transition={{
								type: 'spring',
								duration: 1,
								bounce: 0,
								delay: pauseDuration + 0.6,
							}}
							className="inline-block"
						>
							Hazards, Survivals
						</motion.span>
					</span>
					<span className="block overflow-hidden">
						<motion.span
							initial={{ y: '100%' }}
							animate={{ y: '0%' }}
							transition={{
								type: 'spring',
								duration: 1,
								bounce: 0,
								delay: pauseDuration + 0.7,
							}}
							className="inline-block"
						>
							and Repair in Dominica
						</motion.span>
					</span>
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
				className="relative flex h-10 w-fit items-center rounded-full bg-white text-gray-700 ring-1 ring-gray-500/50"
			>
				<Link
					href="#"
					title="Follow Us on Instagram"
					className="flex h-10 pl-3 pr-2"
				>
					<span className="sr-only">Follow Us on Instagram</span>
					<Icon name="instagram" size={24} className="m-auto" />
				</Link>
				<div className="h-full w-px bg-gray-500/50" />
				<Link
					href="#"
					title="Follow Us on Twitter"
					className="flex h-10 pl-2 pr-3"
				>
					<span className="sr-only">Follow Us on Twitter</span>
					<Icon name="twitter" size={24} className="m-auto" />
				</Link>
			</OrchestratedReveal>
		</section>
	);
}
