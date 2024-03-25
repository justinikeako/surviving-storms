'use client';

import { usePathname } from 'next/navigation';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { AnimatePresence, Variants, motion, useScroll } from 'framer-motion';
import Link from 'next/link';
import { cn } from '~/lib/utils';
import { pauseDuration, pauseDurationMs } from '~/constants';
import { Icon } from './icon';
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import logo from '../public/logo.png';
import goldsmiths from '../public/goldsmiths.png';
import gcrf from '../public/gcrf.png';
import monaGeoinformaticsInstitute from '../public/mona-geoinformatics-institute.png';
import { OrchestratedReveal } from './reveal';

const content: Variants = {
	hide: {
		opacity: 0,
		transition: {
			type: 'spring',
			duration: 0.3,
			bounce: 0,
		},
	},
	show: {
		opacity: 1,
		transition: {
			type: 'spring',
			duration: 0.3,
			bounce: 0,
		},
	},
};

const list: Variants = {
	hide: {},
	show: {
		transition: {
			delayChildren: 0.1,
			staggerChildren: 0.05,
		},
	},
};

const item: Variants = {
	hide: {
		opacity: 0,
		x: -50,
		transition: {
			type: 'spring',
			duration: 0.3,
			bounce: 0,
		},
	},
	show: {
		opacity: 1,
		x: 0,
		transition: {
			type: 'spring',
			duration: 0.75,
			bounce: 0.2,
		},
	},
};

const variants = {
	content,
	list,
	item,
};

function NavLink({
	index,
	children,
	...props
}: React.ComponentPropsWithoutRef<typeof Link> & { index: number }) {
	const pathname = usePathname();
	const active = pathname === props.href;

	const delay = pauseDuration + 1 + 0.1 * index;

	return (
		<motion.li className="space-y-0.5">
			<Link {...props} className="inline-block overflow-hidden">
				<motion.span
					className="inline-block"
					initial={{ y: '100%' }}
					animate={{ y: '0%' }}
					transition={{
						type: 'spring',
						duration: 1,
						bounce: 0,
						delay,
					}}
				>
					{children}
				</motion.span>
			</Link>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{
					opacity: 1,
					transition: { duration: 1, delay: delay + 0.5 },
				}}
				className="h-0.5 w-full"
			>
				{active && (
					<motion.div
						layoutId="underline"
						transition={{ type: 'spring', duration: 1, bounce: 0 }}
						className="h-full rounded-sm bg-yellow-500"
					/>
				)}
			</motion.div>
		</motion.li>
	);
}

const FullscreenMenuNavLink = forwardRef<
	React.ComponentRef<typeof Link>,
	React.ComponentPropsWithoutRef<typeof Link>
>(function NavLink({ href, children, ...props }, ref) {
	return (
		<li className="contents">
			<Link
				{...props}
				href={href}
				ref={ref}
				className={cn('block', props.className)}
			>
				{children}
			</Link>
		</li>
	);
});

const MotionFullscreenMenuNavLink = motion(FullscreenMenuNavLink);

function Letter({
	d,
	delay,
	onAnimationComplete,
}: {
	d: string;
	delay: number;
	onAnimationComplete?(): void;
}) {
	return (
		<motion.path
			initial={{ opacity: 0, y: 64 }}
			animate={{
				opacity: 1,
				y: 0,
				transition: { type: 'spring', bounce: 0, duration: 1, delay },
			}}
			onAnimationComplete={onAnimationComplete}
			d={d}
		/>
	);
}

export function Header() {
	const letterStagger = 0.025;

	const pathname = usePathname();

	const [fullscreenMenuOpen, setFullscreenMenuOpen] = useState(false);
	const [introAnimationComplete, setIntroAnimationComplete] = useState(false);
	const [logoAnimationComplete, setLogoAnimationComplete] = useState(false);

	const headerRef = useRef<HTMLDivElement>(null);

	const { scrollY } = useScroll();
	const [isDark, setIsDark] = useState(['/'].includes(pathname));

	useEffect(() => {
		const headerElement = headerRef.current;
		if (!headerElement) return;

		const darkSections =
			document.querySelectorAll<HTMLDivElement>('[data-header-dark]');

		const headerElementBounds = headerElement.getBoundingClientRect();
		// Get the position and dimensions of the data-header-dark sections
		const darkSectionsBounds = Array.from(darkSections).map((section) => ({
			height: section.getBoundingClientRect().height,
			offsetTop: section.offsetTop,
		}));

		const unsubscribe = scrollY.on('change', (scrollPosition) => {
			const shouldMakeHeaderDark = darkSectionsBounds.some(
				(bounds) =>
					scrollPosition >= bounds.offsetTop - headerElementBounds.height &&
					scrollPosition <= bounds.offsetTop + bounds.height,
			);

			if (shouldMakeHeaderDark !== isDark) setIsDark(shouldMakeHeaderDark);
		});

		return () => unsubscribe();
	}, [scrollY, isDark, pathname]);

	useEffect(() => {
		const timerId = setTimeout(() => {
			setIntroAnimationComplete(true);
		}, pauseDurationMs);

		return () => {
			clearTimeout(timerId);
		};
	}, []);

	return (
		<Dialog.Root
			open={fullscreenMenuOpen}
			modal
			onOpenChange={setFullscreenMenuOpen}
		>
			<header
				ref={headerRef}
				data-dark={isDark || undefined}
				className="group fixed inset-x-0 z-20 data-[dark]:text-gray-50"
			>
				<div className="absolute inset-0 block bg-gray-100 from-black transition-colors mask-gradient-to-b group-data-[dark]:bg-gray-900/75 -z-10" />

				<div className="flex h-20 items-center px-8 2xl:container md:px-16">
					<AnimatePresence>
						{!introAnimationComplete && (
							<motion.div
								initial={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 1 }}
								className="absolute inset-x-0 top-0 flex h-[100dvh] flex-col items-center justify-between bg-gray-900 py-8"
							>
								<OrchestratedReveal fadeOnly condition={logoAnimationComplete}>
									<Image
										src={logo}
										alt="Caribbean Cyclone Cartography"
										className="h-8 object-contain opacity-50 lg:h-10"
									/>
								</OrchestratedReveal>

								<ul className="flex flex-wrap justify-center gap-4 opacity-50">
									<li className="contents">
										<OrchestratedReveal
											asChild
											condition={logoAnimationComplete}
											delay={0.1}
											fadeOnly
										>
											<Image
												src={goldsmiths}
												alt="Goldsmiths"
												className="h-6 object-contain lg:h-auto"
											/>
										</OrchestratedReveal>
									</li>
									<li className="contents">
										<OrchestratedReveal
											asChild
											condition={logoAnimationComplete}
											delay={0.2}
											fadeOnly
										>
											<Image
												src={gcrf}
												alt="Goldsmiths"
												className="h-6 object-contain lg:h-auto"
											/>
										</OrchestratedReveal>
									</li>
									<li className="contents">
										<OrchestratedReveal
											asChild
											condition={logoAnimationComplete}
											delay={0.3}
											fadeOnly
										>
											<Image
												src={monaGeoinformaticsInstitute}
												alt="Mona Geoinformatics Institute (MGI)"
												className="h-6 object-contain lg:h-auto"
											/>
										</OrchestratedReveal>
									</li>
								</ul>
							</motion.div>
						)}
					</AnimatePresence>

					<div
						className={cn(
							!introAnimationComplete &&
								'absolute inset-x-0 top-0 flex h-screen text-gray-50',
						)}
					>
						<motion.div
							layout
							transition={{ type: 'spring', duration: 1, bounce: 0.1 }}
							className="m-auto"
						>
							<svg
								viewBox="0 0 264 128"
								fill="none"
								id="logo"
								className={cn(
									'm-auto aspect-[33/16] fill-current',
									introAnimationComplete ? 'h-8 sm:h-10' : 'h-24 sm:h-32',
								)}
								xmlns="http://www.w3.org/2000/svg"
							>
								{/* Surviving */}
								<g clipPath="url(#clip1_16_724)">
									<Letter
										delay={0 * letterStagger}
										d="M3.77904 57.4946C1.45206 54.9209 0.288574 51.2249 0.288574 46.4065V43.0024H9.13191V47.0355C9.13191 50.8837 10.7435 52.8077 13.9668 52.8077C14.6267 52.8573 15.2895 52.7627 15.9093 52.5306C16.5291 52.2985 17.0909 51.9343 17.5559 51.4634C18.496 50.1417 18.9334 48.5277 18.7893 46.9122C18.8369 44.6022 18.248 42.3237 17.0872 40.326C15.3492 37.743 13.2377 35.432 10.8216 33.4684C7.64998 30.8609 4.92536 27.753 2.75533 24.2674C1.2025 21.4168 0.412278 18.2135 0.461247 14.9678C0.461247 10.2645 1.63707 6.62193 3.98871 4.04007C6.34036 1.4582 9.81027 0.167267 14.3984 0.167267C18.8797 0.167267 22.2633 1.4582 24.5492 4.04007C26.8432 6.61782 27.9903 10.3056 27.9903 15.1404V17.6072H19.1593V14.5361C19.2848 12.9492 18.8482 11.3687 17.9259 10.0713C17.4904 9.58889 16.9511 9.21169 16.3486 8.96812C15.7461 8.72456 15.0961 8.62099 14.4478 8.66523C11.3314 8.66523 9.77327 10.5646 9.77327 14.3634C9.78066 16.5017 10.3967 18.5936 11.5493 20.3946C13.3288 22.9458 15.4588 25.2336 17.8766 27.1905C21.0915 29.7808 23.826 32.9161 25.9552 36.4532C27.4831 39.4826 28.2414 42.8418 28.163 46.2339C28.163 51.1016 26.9584 54.8387 24.5492 57.4452C22.0824 60.06 18.6413 61.355 14.0531 61.355C9.46492 61.355 6.09779 60.0723 3.77904 57.4946Z"
									/>
									<Letter
										delay={1 * letterStagger}
										d="M36.7471 57.4946C34.3708 54.921 33.1826 51.2208 33.1826 46.3942V1.01834H42.5316V47.0356C42.3882 48.6088 42.8271 50.1799 43.765 51.4511C44.219 51.92 44.7698 52.2844 45.379 52.5187C45.9883 52.753 46.6412 52.8517 47.2925 52.8078C47.946 52.8626 48.6036 52.7741 49.2193 52.5482C49.835 52.3224 50.3939 51.9648 50.857 51.5004C51.8014 50.2136 52.2403 48.6247 52.0903 47.0356V1.01834H61.1063V46.4066C61.1063 51.2167 59.9141 54.9169 57.5295 57.507C55.145 60.097 51.6874 61.3797 47.1568 61.3551C42.5933 61.3551 39.1234 60.0683 36.7471 57.4946Z"
									/>
									<Letter
										delay={2 * letterStagger}
										d="M67.6792 1.01834H81.5424C86.3526 1.01834 89.8636 2.1366 92.0755 4.37312C94.2873 6.60964 95.3933 10.0508 95.3933 14.6965V18.3966C95.3933 24.5635 93.3376 28.4733 89.2264 30.126V30.2863C90.2819 30.5772 91.2598 31.0987 92.0895 31.8132C92.9192 32.5277 93.5799 33.4174 94.0242 34.4182C95.0642 37.0961 95.5428 39.9592 95.4303 42.8298V53.2888C95.4146 54.6638 95.4681 56.0387 95.5906 57.4083C95.7287 58.4806 96.0324 59.5249 96.491 60.504H86.9816C86.6608 59.6251 86.4294 58.716 86.2909 57.7906C86.1543 56.2653 86.1008 54.7336 86.1306 53.2025V42.3241C86.1306 39.5983 85.6865 37.6989 84.8108 36.6259C84.2214 36.0333 83.5065 35.5805 82.7189 35.3009C81.9312 35.0213 81.0908 34.9219 80.2597 35.0102H77.0282V60.504H67.6792V1.01834ZM80.457 26.5122C81.2194 26.5709 81.9857 26.4732 82.7089 26.225C83.4322 25.9769 84.0971 25.5835 84.6628 25.0692C85.7341 23.6927 86.2372 21.9581 86.0689 20.222V15.6338C86.206 13.9923 85.8032 12.351 84.9219 10.9593C84.4733 10.4542 83.913 10.0608 83.2857 9.81028C82.6583 9.55976 81.9812 9.4591 81.3081 9.5163H77.0282V26.5122H80.457Z"
									/>
									<Letter
										delay={3 * letterStagger}
										d="M99.1323 1.01834H108.568L114.735 47.1713H114.907L121.074 1.01834H129.708L120.544 60.504H108.136L99.1323 1.01834Z"
									/>
									<Letter
										delay={4 * letterStagger}
										d="M134.061 1.01834H143.361V60.504H134.012L134.061 1.01834Z"
									/>
									<Letter
										delay={5 * letterStagger}
										d="M147.912 1.01834H157.347L163.514 47.1713H163.687L169.854 1.01834H178.488L169.484 60.504H156.928L147.912 1.01834Z"
									/>
									<Letter
										delay={6 * letterStagger}
										d="M182.828 1.01834H192.177V60.504H182.828V1.01834Z"
									/>
									<Letter
										delay={7 * letterStagger}
										d="M199.158 1.01834H210.887L219.977 36.6259H220.15V1.01834H228.463V60.504H218.867L207.643 17.0769H207.495V60.504H199.17L199.158 1.01834Z"
									/>
									<Letter
										delay={8 * letterStagger}
										d="M238.331 57.4946C235.954 54.9209 234.762 51.2208 234.754 46.3942V15.1281C234.754 10.3056 235.987 6.61782 238.331 4.02773C240.674 1.43764 244.177 0.167267 248.703 0.167267C253.23 0.167267 256.696 1.46231 259.076 4.04007C261.457 6.61782 262.641 10.3056 262.641 15.1404V20.2343H253.81V14.5361C253.81 10.6304 252.194 8.67345 248.962 8.66523C245.731 8.657 244.115 10.614 244.115 14.5361V47.0355C244.115 50.8837 245.731 52.8077 248.962 52.8077C252.194 52.8077 253.81 50.8837 253.81 47.0355V35.4418H249.135V26.9439H262.702V46.4065C262.702 51.2167 261.514 54.9168 259.138 57.5069C256.762 60.097 253.304 61.3838 248.765 61.3674C244.202 61.3591 240.723 60.0682 238.331 57.4946Z"
									/>
								</g>

								{/* Storms */}
								<g clipPath="url(#clip0_16_724)">
									<Letter
										delay={9 * letterStagger}
										d="M3.76671 124.245C1.44795 121.667 0.288574 117.979 0.288574 113.144V109.752H9.11958V113.835C9.11958 117.691 10.7353 119.619 13.9668 119.619C14.6355 119.666 15.3062 119.564 15.9309 119.32C16.5556 119.077 17.1189 118.699 17.5806 118.213C18.5148 116.889 18.9516 115.277 18.8139 113.662C18.8466 111.347 18.2406 109.069 17.0625 107.076C15.3152 104.5 13.1954 102.197 10.7723 100.243C7.59894 97.6242 4.87073 94.5086 2.69367 91.0174C1.13718 88.1637 0.346791 84.9555 0.399579 81.7054C0.399579 77.0021 1.59185 73.3637 3.97638 70.79C6.36092 68.2164 9.81438 66.9254 14.3368 66.9172C18.8181 66.9172 22.2057 68.2081 24.4998 70.79C26.7939 73.3719 27.941 77.072 27.941 81.8904V84.3571H19.147V81.286C19.2641 79.7 18.8282 78.1223 17.9136 76.8212C17.4756 76.3386 16.9341 75.9614 16.3296 75.7178C15.7251 75.4743 15.0733 75.3709 14.4231 75.4152C11.315 75.4152 9.7486 77.3146 9.7486 81.1134C9.73965 83.2504 10.3478 85.3447 11.5 87.1446C13.2785 89.7001 15.4086 91.9921 17.8272 93.9528C21.045 96.5401 23.78 99.6759 25.9059 103.215C27.4508 106.236 28.2261 109.592 28.163 112.984C28.163 117.852 26.9584 121.593 24.5492 124.208C22.14 126.822 18.6413 128.126 14.0531 128.117C9.48137 128.117 6.05257 126.826 3.76671 124.245Z"
									/>
									<Letter
										delay={10 * letterStagger}
										d="M40.829 76.2662H31.0483V67.7682H59.9464V76.2662H50.1657V127.266H40.829V76.2662Z"
									/>
									<Letter
										delay={11 * letterStagger}
										d="M67.0883 124.208C64.6216 121.601 63.3882 117.901 63.3882 113.107V81.9028C63.3882 77.1419 64.6216 73.4665 67.0883 70.8024C69.5551 68.1383 73.0332 66.8926 77.6214 66.8926C82.2096 66.8926 85.7247 68.2 88.1668 70.8024C90.6089 73.4048 91.8669 77.0926 91.8669 81.9028V113.156C91.8669 117.917 90.6336 121.617 88.1668 124.257C85.7 126.896 82.1849 128.2 77.6214 128.167C73.0332 128.134 69.5222 126.814 67.0883 124.208ZM82.4316 113.749V81.2861C82.4316 77.3804 80.8158 75.4234 77.5844 75.4152C74.3529 75.407 72.7495 77.3639 72.7742 81.2861V113.749C72.7742 117.654 74.3899 119.611 77.6214 119.619C80.8528 119.628 82.4562 117.671 82.4316 113.749Z"
									/>
									<Letter
										delay={12 * letterStagger}
										d="M98.1074 67.7682H111.958C116.768 67.7682 120.279 68.8865 122.491 71.123C124.711 73.3678 125.809 76.8089 125.809 81.4587V85.1588C125.809 91.3422 123.754 95.252 119.642 96.8882V97.0609C120.705 97.3438 121.69 97.8651 122.521 98.5853C123.352 99.3055 124.009 100.206 124.44 101.217C125.482 103.899 125.96 106.767 125.846 109.641V120.088C125.834 121.463 125.891 122.838 126.019 124.208C126.137 125.282 126.424 126.331 126.87 127.316H117.348C117.031 126.432 116.804 125.519 116.67 124.59C116.527 123.065 116.47 121.533 116.497 120.002V109.037C116.497 106.324 116.065 104.424 115.177 103.351C114.289 102.278 112.785 101.735 110.639 101.735H107.407V127.229H98.1074V67.7682ZM110.799 93.2621C111.575 93.3244 112.355 93.2238 113.09 92.9668C113.825 92.7098 114.498 92.3021 115.066 91.7697C116.127 90.3929 116.625 88.6649 116.46 86.9349V82.3837C116.597 80.7461 116.194 79.1087 115.313 77.7216C114.868 77.2112 114.309 76.8132 113.681 76.5603C113.053 76.3073 112.374 76.2066 111.699 76.2662H107.456V93.2621H110.799Z"
									/>
									<Letter
										delay={13 * letterStagger}
										d="M132.358 67.7682H145.703L151.648 110.357H151.821L157.766 67.7682H171.111V127.266H162.267V82.2234H162.107L155.299 127.266H147.479L140.683 82.2234H140.511V127.266H132.358V67.7682Z"
									/>
									<Letter
										delay={14 * letterStagger}
										d="M179.955 124.245C177.624 121.667 176.464 117.979 176.464 113.144V109.752H185.308V113.835C185.308 117.691 186.923 119.619 190.155 119.619C190.822 119.665 191.491 119.563 192.113 119.32C192.736 119.077 193.297 118.699 193.756 118.213C194.696 116.892 195.134 115.278 194.99 113.662C195.035 111.354 194.451 109.077 193.3 107.076C191.553 104.5 189.433 102.197 187.01 100.243C183.83 97.6312 181.1 94.5144 178.931 91.0174C177.375 88.1637 176.584 84.9555 176.637 81.7054C176.637 77.0021 177.825 73.3637 180.201 70.79C182.578 68.2164 186.035 66.9254 190.574 66.9172C195.051 66.9172 198.443 68.1506 200.725 70.79C203.007 73.4294 204.178 77.0679 204.178 81.8904V84.3571H195.335V81.286C195.458 79.6993 195.022 78.1196 194.102 76.8212C193.666 76.3388 193.127 75.9616 192.524 75.7181C191.922 75.4745 191.272 75.3709 190.624 75.4152C187.499 75.4152 185.941 77.3146 185.949 81.1134C185.942 83.2484 186.545 85.341 187.688 87.1446C189.468 89.7028 191.603 91.9952 194.028 93.9528C197.242 96.54 199.973 99.676 202.094 103.215C203.628 106.238 204.386 109.595 204.302 112.984C204.302 117.852 203.097 121.593 200.688 124.208C198.283 126.81 194.792 128.117 190.192 128.117C185.591 128.117 182.335 126.822 179.955 124.245Z"
										onAnimationComplete={() => setLogoAnimationComplete(true)}
									/>
								</g>

								<defs>
									<clipPath id="clip0_16_724">
										<rect
											width="204.019"
											height="64"
											fill="white"
											transform="translate(0.288574 66.8926)"
										/>
									</clipPath>
									<clipPath id="clip1_16_724">
										<rect
											width="262.414"
											height="64"
											fill="white"
											transform="translate(0.288574 0.167267)"
										/>
									</clipPath>
								</defs>
							</svg>
						</motion.div>
					</div>

					<div className="flex flex-1 justify-end">
						<nav className="hidden gap-6 md:flex">
							<ul className="contents">
								<NavLink index={0} href="/">
									Home
								</NavLink>
								<NavLink index={1} href="https://survivingstorms.com/map">
									Map
								</NavLink>
								<NavLink index={2} href="https://survivingstorms.com/blog">
									Blog
								</NavLink>
								<NavLink index={3} href="https://survivingstorms.com/works">
									Works & Offerings
								</NavLink>
								<NavLink index={4} href="https://survivingstorms.com/about">
									About
								</NavLink>
								<NavLink index={5} href="https://survivingstorms.com/contact">
									Contact
								</NavLink>
								<motion.li
									initial={{ opacity: 0, y: '100%' }}
									animate={{ opacity: 1, y: '0%' }}
									transition={{
										type: 'spring',
										duration: 1,
										bounce: 0,
										delay: pauseDuration + 1 + 0.6,
									}}
								>
									<Link href="https://survivingstorms.com/">
										<Icon name="search" className="w-6" />
									</Link>
								</motion.li>
							</ul>
						</nav>

						<Dialog.Trigger asChild>
							<button className="flex h-10 w-10 items-center justify-center rounded-full md:hidden">
								<Icon name="menu" className="w-6" />
							</button>
						</Dialog.Trigger>
					</div>
				</div>
			</header>

			{/* Fullscreen Menu */}
			<AnimatePresence>
				{fullscreenMenuOpen && (
					<Dialog.DialogPortal forceMount>
						{/* This prevents scrolling outside of the menu */}
						<Dialog.Overlay />

						<Dialog.DialogContent forceMount asChild>
							<motion.div
								variants={variants.content}
								initial="hide"
								animate="show"
								exit="hide"
								className="group fixed inset-0 z-50 bg-gray-900 text-white"
							>
								<div className="fixed inset-x-0 z-10 bg-gray-900">
									<div className="flex h-20 items-center justify-between px-8 2xl:container lg:px-16">
										<Link href="/" onClick={() => setFullscreenMenuOpen(false)}>
											<svg
												viewBox="0 0 264 128"
												fill="none"
												id="logo"
												className="aspect-[33/16] h-8 fill-current sm:h-10"
												xmlns="http://www.w3.org/2000/svg"
											>
												{/* Surviving */}
												<g clipPath="url(#clip1_16_724)">
													<path d="M3.77904 57.4946C1.45206 54.9209 0.288574 51.2249 0.288574 46.4065V43.0024H9.13191V47.0355C9.13191 50.8837 10.7435 52.8077 13.9668 52.8077C14.6267 52.8573 15.2895 52.7627 15.9093 52.5306C16.5291 52.2985 17.0909 51.9343 17.5559 51.4634C18.496 50.1417 18.9334 48.5277 18.7893 46.9122C18.8369 44.6022 18.248 42.3237 17.0872 40.326C15.3492 37.743 13.2377 35.432 10.8216 33.4684C7.64998 30.8609 4.92536 27.753 2.75533 24.2674C1.2025 21.4168 0.412278 18.2135 0.461247 14.9678C0.461247 10.2645 1.63707 6.62193 3.98871 4.04007C6.34036 1.4582 9.81027 0.167267 14.3984 0.167267C18.8797 0.167267 22.2633 1.4582 24.5492 4.04007C26.8432 6.61782 27.9903 10.3056 27.9903 15.1404V17.6072H19.1593V14.5361C19.2848 12.9492 18.8482 11.3687 17.9259 10.0713C17.4904 9.58889 16.9511 9.21169 16.3486 8.96812C15.7461 8.72456 15.0961 8.62099 14.4478 8.66523C11.3314 8.66523 9.77327 10.5646 9.77327 14.3634C9.78066 16.5017 10.3967 18.5936 11.5493 20.3946C13.3288 22.9458 15.4588 25.2336 17.8766 27.1905C21.0915 29.7808 23.826 32.9161 25.9552 36.4532C27.4831 39.4826 28.2414 42.8418 28.163 46.2339C28.163 51.1016 26.9584 54.8387 24.5492 57.4452C22.0824 60.06 18.6413 61.355 14.0531 61.355C9.46492 61.355 6.09779 60.0723 3.77904 57.4946Z" />
													<path d="M36.7471 57.4946C34.3708 54.921 33.1826 51.2208 33.1826 46.3942V1.01834H42.5316V47.0356C42.3882 48.6088 42.8271 50.1799 43.765 51.4511C44.219 51.92 44.7698 52.2844 45.379 52.5187C45.9883 52.753 46.6412 52.8517 47.2925 52.8078C47.946 52.8626 48.6036 52.7741 49.2193 52.5482C49.835 52.3224 50.3939 51.9648 50.857 51.5004C51.8014 50.2136 52.2403 48.6247 52.0903 47.0356V1.01834H61.1063V46.4066C61.1063 51.2167 59.9141 54.9169 57.5295 57.507C55.145 60.097 51.6874 61.3797 47.1568 61.3551C42.5933 61.3551 39.1234 60.0683 36.7471 57.4946Z" />
													<path d="M67.6792 1.01834H81.5424C86.3526 1.01834 89.8636 2.1366 92.0755 4.37312C94.2873 6.60964 95.3933 10.0508 95.3933 14.6965V18.3966C95.3933 24.5635 93.3376 28.4733 89.2264 30.126V30.2863C90.2819 30.5772 91.2598 31.0987 92.0895 31.8132C92.9192 32.5277 93.5799 33.4174 94.0242 34.4182C95.0642 37.0961 95.5428 39.9592 95.4303 42.8298V53.2888C95.4146 54.6638 95.4681 56.0387 95.5906 57.4083C95.7287 58.4806 96.0324 59.5249 96.491 60.504H86.9816C86.6608 59.6251 86.4294 58.716 86.2909 57.7906C86.1543 56.2653 86.1008 54.7336 86.1306 53.2025V42.3241C86.1306 39.5983 85.6865 37.6989 84.8108 36.6259C84.2214 36.0333 83.5065 35.5805 82.7189 35.3009C81.9312 35.0213 81.0908 34.9219 80.2597 35.0102H77.0282V60.504H67.6792V1.01834ZM80.457 26.5122C81.2194 26.5709 81.9857 26.4732 82.7089 26.225C83.4322 25.9769 84.0971 25.5835 84.6628 25.0692C85.7341 23.6927 86.2372 21.9581 86.0689 20.222V15.6338C86.206 13.9923 85.8032 12.351 84.9219 10.9593C84.4733 10.4542 83.913 10.0608 83.2857 9.81028C82.6583 9.55976 81.9812 9.4591 81.3081 9.5163H77.0282V26.5122H80.457Z" />
													<path d="M99.1323 1.01834H108.568L114.735 47.1713H114.907L121.074 1.01834H129.708L120.544 60.504H108.136L99.1323 1.01834Z" />
													<path d="M134.061 1.01834H143.361V60.504H134.012L134.061 1.01834Z" />
													<path d="M147.912 1.01834H157.347L163.514 47.1713H163.687L169.854 1.01834H178.488L169.484 60.504H156.928L147.912 1.01834Z" />
													<path d="M182.828 1.01834H192.177V60.504H182.828V1.01834Z" />
													<path d="M199.158 1.01834H210.887L219.977 36.6259H220.15V1.01834H228.463V60.504H218.867L207.643 17.0769H207.495V60.504H199.17L199.158 1.01834Z" />
													<path d="M238.331 57.4946C235.954 54.9209 234.762 51.2208 234.754 46.3942V15.1281C234.754 10.3056 235.987 6.61782 238.331 4.02773C240.674 1.43764 244.177 0.167267 248.703 0.167267C253.23 0.167267 256.696 1.46231 259.076 4.04007C261.457 6.61782 262.641 10.3056 262.641 15.1404V20.2343H253.81V14.5361C253.81 10.6304 252.194 8.67345 248.962 8.66523C245.731 8.657 244.115 10.614 244.115 14.5361V47.0355C244.115 50.8837 245.731 52.8077 248.962 52.8077C252.194 52.8077 253.81 50.8837 253.81 47.0355V35.4418H249.135V26.9439H262.702V46.4065C262.702 51.2167 261.514 54.9168 259.138 57.5069C256.762 60.097 253.304 61.3838 248.765 61.3674C244.202 61.3591 240.723 60.0682 238.331 57.4946Z" />
												</g>

												{/* Storms */}
												<g clipPath="url(#clip0_16_724)">
													<path d="M3.76671 124.245C1.44795 121.667 0.288574 117.979 0.288574 113.144V109.752H9.11958V113.835C9.11958 117.691 10.7353 119.619 13.9668 119.619C14.6355 119.666 15.3062 119.564 15.9309 119.32C16.5556 119.077 17.1189 118.699 17.5806 118.213C18.5148 116.889 18.9516 115.277 18.8139 113.662C18.8466 111.347 18.2406 109.069 17.0625 107.076C15.3152 104.5 13.1954 102.197 10.7723 100.243C7.59894 97.6242 4.87073 94.5086 2.69367 91.0174C1.13718 88.1637 0.346791 84.9555 0.399579 81.7054C0.399579 77.0021 1.59185 73.3637 3.97638 70.79C6.36092 68.2164 9.81438 66.9254 14.3368 66.9172C18.8181 66.9172 22.2057 68.2081 24.4998 70.79C26.7939 73.3719 27.941 77.072 27.941 81.8904V84.3571H19.147V81.286C19.2641 79.7 18.8282 78.1223 17.9136 76.8212C17.4756 76.3386 16.9341 75.9614 16.3296 75.7178C15.7251 75.4743 15.0733 75.3709 14.4231 75.4152C11.315 75.4152 9.7486 77.3146 9.7486 81.1134C9.73965 83.2504 10.3478 85.3447 11.5 87.1446C13.2785 89.7001 15.4086 91.9921 17.8272 93.9528C21.045 96.5401 23.78 99.6759 25.9059 103.215C27.4508 106.236 28.2261 109.592 28.163 112.984C28.163 117.852 26.9584 121.593 24.5492 124.208C22.14 126.822 18.6413 128.126 14.0531 128.117C9.48137 128.117 6.05257 126.826 3.76671 124.245Z" />
													<path d="M40.829 76.2662H31.0483V67.7682H59.9464V76.2662H50.1657V127.266H40.829V76.2662Z" />
													<path d="M67.0883 124.208C64.6216 121.601 63.3882 117.901 63.3882 113.107V81.9028C63.3882 77.1419 64.6216 73.4665 67.0883 70.8024C69.5551 68.1383 73.0332 66.8926 77.6214 66.8926C82.2096 66.8926 85.7247 68.2 88.1668 70.8024C90.6089 73.4048 91.8669 77.0926 91.8669 81.9028V113.156C91.8669 117.917 90.6336 121.617 88.1668 124.257C85.7 126.896 82.1849 128.2 77.6214 128.167C73.0332 128.134 69.5222 126.814 67.0883 124.208ZM82.4316 113.749V81.2861C82.4316 77.3804 80.8158 75.4234 77.5844 75.4152C74.3529 75.407 72.7495 77.3639 72.7742 81.2861V113.749C72.7742 117.654 74.3899 119.611 77.6214 119.619C80.8528 119.628 82.4562 117.671 82.4316 113.749Z" />
													<path d="M98.1074 67.7682H111.958C116.768 67.7682 120.279 68.8865 122.491 71.123C124.711 73.3678 125.809 76.8089 125.809 81.4587V85.1588C125.809 91.3422 123.754 95.252 119.642 96.8882V97.0609C120.705 97.3438 121.69 97.8651 122.521 98.5853C123.352 99.3055 124.009 100.206 124.44 101.217C125.482 103.899 125.96 106.767 125.846 109.641V120.088C125.834 121.463 125.891 122.838 126.019 124.208C126.137 125.282 126.424 126.331 126.87 127.316H117.348C117.031 126.432 116.804 125.519 116.67 124.59C116.527 123.065 116.47 121.533 116.497 120.002V109.037C116.497 106.324 116.065 104.424 115.177 103.351C114.289 102.278 112.785 101.735 110.639 101.735H107.407V127.229H98.1074V67.7682ZM110.799 93.2621C111.575 93.3244 112.355 93.2238 113.09 92.9668C113.825 92.7098 114.498 92.3021 115.066 91.7697C116.127 90.3929 116.625 88.6649 116.46 86.9349V82.3837C116.597 80.7461 116.194 79.1087 115.313 77.7216C114.868 77.2112 114.309 76.8132 113.681 76.5603C113.053 76.3073 112.374 76.2066 111.699 76.2662H107.456V93.2621H110.799Z" />
													<path d="M132.358 67.7682H145.703L151.648 110.357H151.821L157.766 67.7682H171.111V127.266H162.267V82.2234H162.107L155.299 127.266H147.479L140.683 82.2234H140.511V127.266H132.358V67.7682Z" />
													<path d="M179.955 124.245C177.624 121.667 176.464 117.979 176.464 113.144V109.752H185.308V113.835C185.308 117.691 186.923 119.619 190.155 119.619C190.822 119.665 191.491 119.563 192.113 119.32C192.736 119.077 193.297 118.699 193.756 118.213C194.696 116.892 195.134 115.278 194.99 113.662C195.035 111.354 194.451 109.077 193.3 107.076C191.553 104.5 189.433 102.197 187.01 100.243C183.83 97.6312 181.1 94.5144 178.931 91.0174C177.375 88.1637 176.584 84.9555 176.637 81.7054C176.637 77.0021 177.825 73.3637 180.201 70.79C182.578 68.2164 186.035 66.9254 190.574 66.9172C195.051 66.9172 198.443 68.1506 200.725 70.79C203.007 73.4294 204.178 77.0679 204.178 81.8904V84.3571H195.335V81.286C195.458 79.6993 195.022 78.1196 194.102 76.8212C193.666 76.3388 193.127 75.9616 192.524 75.7181C191.922 75.4745 191.272 75.3709 190.624 75.4152C187.499 75.4152 185.941 77.3146 185.949 81.1134C185.942 83.2484 186.545 85.341 187.688 87.1446C189.468 89.7028 191.603 91.9952 194.028 93.9528C197.242 96.54 199.973 99.676 202.094 103.215C203.628 106.238 204.386 109.595 204.302 112.984C204.302 117.852 203.097 121.593 200.688 124.208C198.283 126.81 194.792 128.117 190.192 128.117C185.591 128.117 182.335 126.822 179.955 124.245Z" />
												</g>

												<defs>
													<clipPath id="clip0_16_724">
														<rect
															width="204.019"
															height="64"
															fill="white"
															transform="translate(0.288574 66.8926)"
														/>
													</clipPath>
													<clipPath id="clip1_16_724">
														<rect
															width="262.414"
															height="64"
															fill="white"
															transform="translate(0.288574 0.167267)"
														/>
													</clipPath>
												</defs>
											</svg>
										</Link>

										<Dialog.Close asChild>
											<button className="flex h-10 w-10 items-center justify-center rounded-full">
												<Icon name="close" className="w-6" />
											</button>
										</Dialog.Close>
									</div>
								</div>

								<div className="flex h-full flex-col overflow-y-auto px-6 py-24 md:px-16">
									<motion.ul
										variants={variants.list}
										initial="hide"
										animate="show"
										className="my-auto flex flex-col gap-8 text-center font-display text-4xl md:text-5xl lg:text-6xl"
									>
										<MotionFullscreenMenuNavLink
											href="/"
											variants={variants.item}
											onClick={() => setFullscreenMenuOpen(false)}
										>
											Home
										</MotionFullscreenMenuNavLink>
										<MotionFullscreenMenuNavLink
											href="https://survivingstorms.com/map"
											variants={variants.item}
										>
											Map
										</MotionFullscreenMenuNavLink>
										<MotionFullscreenMenuNavLink
											href="https://survivingstorms.com/blog"
											variants={variants.item}
										>
											Blog
										</MotionFullscreenMenuNavLink>
										<MotionFullscreenMenuNavLink
											href="https://survivingstorms.com/works"
											variants={variants.item}
										>
											Works & Offerings
										</MotionFullscreenMenuNavLink>
										<MotionFullscreenMenuNavLink
											href="https://survivingstorms.com/about"
											variants={variants.item}
										>
											About
										</MotionFullscreenMenuNavLink>
										<MotionFullscreenMenuNavLink
											href="https://survivingstorms.com/contact"
											variants={variants.item}
										>
											Contact
										</MotionFullscreenMenuNavLink>
									</motion.ul>
								</div>
							</motion.div>
						</Dialog.DialogContent>
					</Dialog.DialogPortal>
				)}
			</AnimatePresence>
		</Dialog.Root>
	);
}
