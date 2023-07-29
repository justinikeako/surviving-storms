'use client';

import { motion, useInView, Transition, useReducedMotion } from 'framer-motion';
import { Slot, SlotProps } from '@radix-ui/react-slot';
import { forwardRef, useRef } from 'react';

const MotionSlot = motion(
	Slot as React.ForwardRefExoticComponent<
		Omit<SlotProps, 'style'> & React.RefAttributes<HTMLElement>
	>,
);

type MotionSlotProps<ExtendProps> = React.ComponentPropsWithoutRef<
	typeof MotionSlot
> &
	ExtendProps;

const transition: Transition = {
	type: 'spring',
	duration: 1,
	bounce: 0,
};

type ViewportRevealProps = MotionSlotProps<{
	asChild?: boolean;
}>;

function ViewportReveal({ asChild, ...props }: ViewportRevealProps) {
	const Comp = asChild ? MotionSlot : motion.div;

	const shouldReduceMotion = useReducedMotion();
	const elementRef = useRef<HTMLDivElement>(null);
	const elementIsInView = useInView(elementRef, {
		once: true,
		margin: '0px 160px -160px 0px',
	});

	return (
		<Comp
			{...props}
			ref={elementRef}
			initial={{
				y: shouldReduceMotion ? 1 : 10,
				scale: shouldReduceMotion ? 1 : 0.975,
				opacity: 0,
			}}
			animate={elementIsInView && { y: 0, scale: 1, opacity: 1 }}
			transition={transition}
		/>
	);
}

type OrchestratedRevealProps = MotionSlotProps<{
	asChild?: boolean;
	fadeOnly?: boolean;
	delay?: number;
}>;

const OrchestratedReveal = forwardRef<
	React.ElementRef<'div'>,
	OrchestratedRevealProps
>(({ delay = 0, asChild, fadeOnly, ...props }, ref) => {
	const Comp = asChild ? MotionSlot : motion.div;
	const shouldReduceMotion = useReducedMotion() || fadeOnly;

	return (
		<Comp
			{...props}
			ref={ref}
			initial={{ y: shouldReduceMotion ? 0 : 48, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ ...transition, delay }}
		>
			{props.children}
		</Comp>
	);
});

OrchestratedReveal.displayName = 'OrchestratedReveal';

export { ViewportReveal, OrchestratedReveal };
