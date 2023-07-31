'use client';

import { motion } from 'framer-motion';
import { useContainerInView } from './reveal';

export function OrchestratedLineReveal({
	lines,
	delay,
}: {
	lines: string[];
	delay?: number;
}) {
	return (
		<>
			{lines.map((text, index) => (
				<span key={index} className="block overflow-hidden">
					<motion.span
						initial={{ y: '100%' }}
						animate={{ y: '0%' }}
						transition={{
							type: 'spring',
							duration: 1,
							bounce: 0,
							delay: (delay ?? 0) + index * 0.1,
						}}
						className="inline-block"
					>
						{text}
					</motion.span>
				</span>
			))}
		</>
	);
}

export function ContainerLineReveal({
	lines,
	delay,
}: {
	lines: string[];
	delay?: number;
}) {
	const containerIsInView = useContainerInView();

	return (
		<>
			{lines.map((text, index) => (
				<span key={index} className="block overflow-hidden">
					<motion.span
						initial={{ y: '100%' }}
						animate={containerIsInView && { y: '0%' }}
						transition={{
							type: 'spring',
							duration: 1,
							bounce: 0,
							delay: (delay ?? 0) + index * 0.1,
						}}
						className="inline-block"
					>
						{text}
					</motion.span>
				</span>
			))}
		</>
	);
}
