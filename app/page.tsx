import Link from 'next/link';
import { Hero } from '~/components/hero';
import { ContainerLineReveal } from '~/components/line-reveal';
import {
	ContainerOrchestratedReveal,
	ViewportReveal,
	ViewportRevealContainer,
} from '~/components/reveal';
import { cn } from '~/lib/utils';
import { Balancer } from 'react-wrap-balancer';
import { HorizontalScroller } from '~/components/horizontal-scroller';
import { Slot } from '@radix-ui/react-slot';
import { Icon } from '~/components/icon';
import logo from '../public/logo.png';
import goldsmiths from '../public/goldsmiths.png';
import gcrf from '../public/gcrf.png';
import monaGeoinformaticsInstitute from '../public/mona-geoinformatics-institute.png';
import Image from 'next/image';

function ChristmasGhostCard({
	heading,
	body,
	delay,
	className,
}: {
	heading: string;
	body: string;
	delay: number;
	className: string;
}) {
	return (
		<ContainerOrchestratedReveal asChild delay={delay}>
			<li className="flex max-w-sm items-center gap-4">
				<svg
					width="51"
					height="70"
					viewBox="0 0 51 70"
					className={cn(
						'mask-cover mask-center mask-[url(/painted-mask-small.webp)]',
						className,
					)}
					xmlns="http://www.w3.org/2000/svg"
				>
					<use href={'/sprite.svg#' + heading.toLowerCase()} />
				</svg>

				<div className="flex-1">
					<h3 className="font-display text-lg md:text-xl">{heading}</h3>
					<p>{body}</p>
				</div>
			</li>
		</ContainerOrchestratedReveal>
	);
}

function QuickLink({
	delay,
	...props
}: React.ComponentProps<typeof Link> & { delay: number }) {
	return (
		<li className="contents">
			<ContainerOrchestratedReveal asChild fadeOnly delay={delay}>
				<Link
					{...props}
					className={cn(
						'bg-gray flex h-16 w-64 shrink-0 items-center justify-center px-8 font-display text-xl uppercase text-gray-50 transition-colors mask-contain mask-luminance mask-center mask-no-repeat mask-[url(/brush-mask.webp)] active:transition-none',
						props.className,
					)}
				/>
			</ContainerOrchestratedReveal>
		</li>
	);
}

function BlogLink({
	by,
	title,
	previewContent,
	category,
	date,
	imageSrc,
	...props
}: React.ComponentProps<typeof Link> & {
	by: string;
	title: string;
	previewContent: string;
	category: string;
	date: string;
	imageSrc: string;
}) {
	return (
		<li className="w-64 shrink-0">
			<div className="aspect-square w-full bg-gray-300">
				<Image src={imageSrc} alt={title} width={256} height={256} />
			</div>
			<div className="relative -mt-12 ml-4 w-full space-y-2 rounded-sm bg-white p-4 ring-1 ring-gray-900/10">
				<p className="text-yellow-600">{by}</p>
				<h3 className="font-display text-xl uppercase lg:text-2xl">
					<Link
						{...props}
						className="transition-colors hover:text-yellow-700 active:text-yellow-800 active:transition-none"
					>
						<Balancer>{title}</Balancer>
					</Link>
				</h3>
				<p className="text-gray-500">{previewContent}</p>
				<hr className="!mt-4 w-16 border-gray-300" />
				<p className="text-gray-500">
					{category} {'//'} {date}
				</p>
			</div>
		</li>
	);
}

function WorkLink({
	by,
	title,
	previewContent,
	category,
	date,
	imageSrc,
	...props
}: React.ComponentProps<typeof Link> & {
	by: string;
	title: string;
	previewContent: string;
	category: 'Podcasts' | 'Workshops' | 'Publications';
	date: string;
	imageSrc: string;
}) {
	return (
		<li className="flex shrink-0">
			<div className="relative aspect-document w-60 shrink-0 bg-gray-300">
				<Image
					src={imageSrc}
					alt={title}
					fill
					sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw"
					className="absolute object-cover"
				/>
			</div>

			<div className="relative -ml-20 mb-8 flex aspect-document w-60 shrink-0 overflow-hidden rounded-sm bg-white ring-1 ring-gray-900/10">
				<div
					className={cn(
						'flex h-fit w-8 items-end justify-center py-4 text-gray-50',
						category === 'Podcasts' && 'bg-yellow-600',
						category === 'Workshops' && 'bg-lime-700',
						category === 'Publications' && 'bg-gray-800',
					)}
				>
					<p className="w-fit rotate-180 font-display [writing-mode:vertical-lr]">
						{category}
					</p>
				</div>
				<div className="flex h-full flex-1 flex-col justify-between p-4">
					<div className="space-y-2">
						<p
							className={cn(
								category === 'Podcasts' && 'text-yellow-600',
								category === 'Workshops' && 'text-lime-700',
								category === 'Publications' && 'text-gray-600',
							)}
						>
							{by}
						</p>
						<h3 className="font-display text-xl uppercase">
							<Link
								{...props}
								className={cn(
									'transition-color active:transition-none',
									category === 'Podcasts' &&
										'hover:text-yellow-700 active:text-yellow-800',
									category === 'Workshops' &&
										'hover:text-lime-800 active:text-lime-900',
									category === 'Publications' &&
										'hover:text-gray-600 active:text-gray-900',
								)}
							>
								<Balancer>{title}</Balancer>
							</Link>
						</h3>
						<p className="text-gray-500">{previewContent}</p>
					</div>

					<div className="space-y-2">
						<hr className="!mt-4 w-16 border-gray-300" />
						<p className="text-gray-500">{date}</p>
					</div>
				</div>
			</div>
		</li>
	);
}

function Card({
	text,
	heading,
	callToAction,
}: {
	text: string;
	heading: string;
	callToAction: React.ReactNode;
}) {
	return (
		<div className="flex h-72 w-full min-w-fit overflow-hidden rounded-sm bg-white ring-1 ring-gray-900/10 md:h-80 md:w-auto md:flex-1 2xl:h-96">
			<div className="flex h-full w-12 shrink-0 flex-col items-center justify-between bg-gray-800 py-8 text-gray-50">
				<p className="rotate-180 select-none font-display text-base/[14px] uppercase [writing-mode:vertical-lr]">
					Surviving
					<br />
					Storms
				</p>

				<p className="rotate-180 font-display text-2xl uppercase [writing-mode:vertical-lr]">
					{text}
				</p>
			</div>
			<div className="flex h-full grow flex-col p-8">
				<h2 className="max-w-xs font-display text-3xl xl:text-4xl 2xl:text-5xl">
					<Balancer>{heading}</Balancer>
				</h2>
				<Slot className="mt-auto underline">{callToAction}</Slot>
			</div>
		</div>
	);
}

export default function Home() {
	return (
		<>
			<main className="px-8 2xl:container md:px-16">
				<Hero />

				{/* First Section */}
				<ViewportRevealContainer asChild>
					<section className="relative space-y-16 py-16">
						<div className="mx-auto flex w-fit flex-col gap-12 py-8 sm:mr-0 sm:gap-8 md:flex-row md:items-center lg:w-full lg:justify-center lg:gap-16 2xl:justify-around">
							<ContainerOrchestratedReveal
								fadeOnly
								className="absolute left-0 top-12 aspect-[71/117] w-full shrink-0 xs:w-3/4 sm:w-2/5 md:top-auto md:w-1/3 lg:relative lg:left-auto lg:w-1/5 "
							>
								<Image
									src="/map.png"
									alt="Unlabeled map of dominica"
									fill
									sizes="(max-width: 640px) 95vw, (max-width: 420px) 80vw, (max-width: 768px) 40vw, (max-width: 1024px) 25vw"
									className="absolute object-contain opacity-50 lg:opacity-100"
								/>
							</ContainerOrchestratedReveal>

							<h2 className="relative ml-[67px] shrink-0 font-display text-3xl uppercase xs:text-4xl sm:ml-0 md:text-5xl lg:text-6xl 2xl:text-7xl">
								<ContainerLineReveal
									delay={0.1}
									lines={[
										'Making Life Amidst',
										'the Environmental',
										'Crises of Man',
									]}
								/>
							</h2>

							<ul className="relative space-y-8">
								<ChristmasGhostCard
									delay={0.4}
									heading="Past"
									body="Learning how communities survived past storms and built houses with the hurricane in mind."
									className="fill-yellow-600"
								/>
								<ChristmasGhostCard
									delay={0.5}
									heading="Present"
									className="fill-gray-700"
									body="Sharing stories of life and repair in the wake of Hurricane Maria and other storms."
								/>
								<ChristmasGhostCard
									delay={0.6}
									heading="Future"
									className="fill-lime-700"
									body="Locating hazards and sharing knowledge of adaption in a warming world."
								/>
							</ul>
						</div>

						<ul className="flex flex-wrap justify-around gap-8">
							<QuickLink
								href="https://survivingstorms.com/workshops"
								className="bg-lime-700 hover:bg-lime-600 active:bg-lime-800"
								delay={0.8}
							>
								Workshops
							</QuickLink>
							<QuickLink
								href="https://survivingstorms.com/publications"
								className="bg-gray-800 hover:bg-gray-700 active:bg-gray-900"
								delay={0.9}
							>
								Publications
							</QuickLink>
							<QuickLink
								href="https://survivingstorms.com/interventions"
								className="bg-red-600 hover:bg-red-500 active:bg-red-700"
								delay={1}
							>
								Interventions
							</QuickLink>
							<QuickLink
								href="https://survivingstorms.com/podcasts"
								className="bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-700"
								delay={1.1}
							>
								Podcasts
							</QuickLink>
						</ul>
					</section>
				</ViewportRevealContainer>

				{/* Blog */}
				<section className="relative -mx-8 space-y-12 px-8 py-16 md:-mx-16 md:px-16">
					<div className="absolute left-0 -z-10 aspect-[1/2] h-3/4 opacity-10">
						<Image
							src="/background-logo.png"
							alt="Caribbean Cyclone Cartography Logo"
							fill
							sizes="(max-width: 640px) 75vw, (max-width: 768px) 50vw, (max-width: 1536px) 40vw"
							className="absolute rotate-180"
						/>
					</div>

					<ViewportReveal asChild>
						<h2 className="text-center font-display text-xl uppercase md:text-2xl">
							Latest From The Blog
						</h2>
					</ViewportReveal>

					<ViewportReveal asChild>
						<HorizontalScroller className="gap-8 pb-px before:-mr-8 after:-ml-8">
							<BlogLink
								href="https://survivingstorms.com/2022/12/06/surviving-storms-ccc-uk-symposium-2022-goldsmiths/"
								imageSrc="/blog/1.png"
								by="Abibat Kareem"
								title="Surviving Storms | CCC UK Symposium 2022 @Goldsmiths"
								previewContent="On the 7th of November 2022, a rainy Monday morning, we gathered into a classroom in the Professor Stuart Hall building at Goldsmiths University for the UK Symposium for the Surviving Storms | Caribbean Cyclone Cartography project. In the room from Dominica were project collaborators Kaila Ann Guiste and Gibran Espirit (research interns), along with…"
								category="Uncategorized"
								date="06.12.2022"
							/>
							<BlogLink
								href="https://survivingstorms.com/2022/11/03/still-standing-the-ti-kais-of-dominica-2-2/"
								imageSrc="/blog/2.png"
								by="Adom Philogene Heron"
								title="NEW BOOK! Papillote Press presents, ‘Still Standing: the Ti Kais of Dominica’"
								previewContent="Still Standing By Adom Philogene Heron Photographs by Marica Honychurch ISBN: 9781838041588 Original paperback Price: £21.50 Publication: October 2022 This beautifully illustrated book is a celebration of the vanishing vernacular architecture of Dominica. These small wooden homes, ingeniously crafted and carefully adapted to their environment, have withstood hurricanes and earthquakes since their emergence in the post- emancipation period..."
								category="Still standing: The Ti KAi project"
								date="03.11.2022"
							/>
							<BlogLink
								href="https://survivingstorms.com/2022/10/03/a-tribute-to-women-farmers-in-dominica%ef%bf%bc/"
								imageSrc="/blog/3.png"
								by="Cecilia Green"
								title="A Tribute to Women Farmers in Dominica"
								previewContent="Still Standing By Adom Philogene Heron Photographs by Marica Honychurch ISBN: 9781838041588 Original paperback Price: £21.50 Publication: October 2022 This beautifully illustrated book is a celebration of the vanishing vernacular architecture of Dominica. These small wooden homes, ingeniously crafted and carefully adapted to their environment, have withstood hurricanes and earthquakes since their emergence in the post- emancipation period…"
								category="Surviving Storms Past"
								date="03.11.2022"
							/>
							<BlogLink
								href="https://survivingstorms.com/2022/09/23/mgis-2022-symposium-report-dominica-well-on-the-road-to-recovery/"
								imageSrc="/blog/4.png"
								by="Gabrielle C. Abraham"
								title="MGI’s 2022 Symposium Report: Dominica well on the road to recovery"
								previewContent="As the Surviving Storms | Caribbean Cyclone Cartography Project approaches its final months, our first post-research symposium took place at the Fort Young Hotel, in the Commonwealth of Dominica on August 25th and 26th 2022. Each work package presented its outcomes so far at the interactive workshop, which included short films, books (soon to be…"
								category="Uncategorized"
								date="23.09.2022"
							/>
							<BlogLink
								href="https://survivingstorms.com/2022/05/26/still-standing-the-ti-kais-of-dominica-2/"
								imageSrc="/blog/5.webp"
								by="Adom Philogene Heron"
								title="MGI’s 2022 Symposium Report: Dominica well on the road to recovery"
								previewContent="CLACS, School of Advanced Study University of London Seminar Online presentation introducing the Ti Kai Project Chair: Oscar Webber (CLACS, IMLR) Speakers: Adom Philogene Heron (Goldsmiths, University of London)Marica Honychurch (Photographer and President of Dominican Society for Heritage, Architectural, Preservation and Enhancement, SHAPE) Jeanne Royer (Dominican architecture student, Havana) Polly Patullo (Author, publisher, and co-founder of Papillote Press)…"
								category="Still standing: The Ti KAi project"
								date="26.05.2022"
							/>
						</HorizontalScroller>
					</ViewportReveal>
				</section>

				{/* Map */}
				<section
					data-header-dark
					className="relative -mx-8 flex h-96 text-center text-gray-50 md:-mx-16"
				>
					<div className="absolute inset-x-0 -z-10 h-96 bg-gray-950">
						<div className="absolute h-full w-full bg-[url(/map.svg)] bg-contain bg-fixed bg-center bg-no-repeat md:bg-cover" />

						<div className="absolute h-full w-full bg-gray-900 mask-cover mask-center mask-[url(/painted-mask.webp)]"></div>
					</div>

					<div className="m-auto">
						<h2 className="font-display text-3xl uppercase xs:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
							<Link
								href="https://survivingstorms.com/map/"
								className="before:absolute before:inset-0 before:block"
							>
								Explore The Map
							</Link>
						</h2>
						<p className="text-gray-400">
							Experience the stories // Meet the communities
						</p>
					</div>
				</section>

				{/* Works */}
				<section className="space-y-12 py-16">
					<ViewportReveal asChild>
						<h2 className="text-center font-display text-xl uppercase md:text-2xl">
							Latest Works & Offerings
						</h2>
					</ViewportReveal>

					<ViewportReveal asChild>
						<HorizontalScroller className="gap-8 py-px before:-mr-8 after:-ml-8">
							<WorkLink
								href="https://survivingstorms.com/podcasts/still-standing-notes-from-the-ti-kai-project-dominica-clacs-school-of-adavanced-study-university-of-london/"
								by="Adom Philogene Heron"
								title="Still Standing: Notes from the Ti Kai Project, Dominica | presentation at CLACS"
								previewContent="A presentation at the Centre for Latin American and Caribbean Studies, School of Advanced Study,…"
								category="Podcasts"
								date="19.09.2022"
								imageSrc="/works/1.png"
							/>
							<WorkLink
								href="https://survivingstorms.com/podcasts/dominica-story-project-presentation-caribbean-studies-network-oxford-university/"
								by="Adom Philogene Heron"
								title="Dominica Story Project Presentation |Caribbean Studies Network|Oxford University"
								previewContent="Create Caribbean interns Kaila Ann Guiste + Tracy Daway joined Dr Schuyler Esprit + Dr…"
								category="Podcasts"
								date="19.09.2022"
								imageSrc="/works/2.png"
							/>
							<WorkLink
								href="https://survivingstorms.com/podcasts/geographies-of-risk-podcast/"
								by="Adom Philogene Heron"
								title="‘Geographies of Risk’ podcast"
								previewContent="Adom speaks with Environmental Dynamics Lab’s Dr Eli Lazarus about the project + survival plots…"
								category="Podcasts"
								date="23.12.2021"
								imageSrc="/works/3.png"
							/>
							<WorkLink
								href="https://survivingstorms.com/workshops/surviving-storms-ccc-inaugural-symposium/"
								by="Annabel Wilson"
								title="Inaugural Project Symposium"
								previewContent="Morne Bruce, Dominica | 6th May 2021 On the 6th May 2021 the Surviving Storms…"
								category="Workshops"
								date="18.06.2021"
								imageSrc="/works/4.png"
							/>
							<WorkLink
								href="https://survivingstorms.com/publications/heartland/"
								by="Schuyler Espirit"
								title="Heartland"
								previewContent="A love letter to fruit and family | An almanac for Caribbean futures This multi-modal…"
								category="Publications"
								date="17.06.2021"
								imageSrc="/works/5.jpeg"
							/>
						</HorizontalScroller>
					</ViewportReveal>
				</section>

				{/* Info */}
				<ViewportReveal asChild>
					<section className="relative -mx-8 flex flex-col gap-6 px-8 py-16 md:-mx-16 md:flex-row md:flex-wrap md:items-center md:px-16">
						<Card
							text="About"
							heading="Mapping hurricane hazards, survivals and repair in Dominica"
							callToAction={
								<Link href="https://survivingstorms.com/about">
									Our project goals
								</Link>
							}
						/>
						<Card
							text="Meet"
							heading="Our Caribbean-led project team"
							callToAction={
								<Link href="https://survivingstorms.com/about#team-list">
									Meet our team members
								</Link>
							}
						/>

						<div className="absolute right-0 -z-10 aspect-[1/2] h-full opacity-25 sm:h-3/4 md:z-auto md:opacity-100 lg:h-full">
							<Image
								src="/background-logo.png"
								alt="Caribbean Cyclone Cartography Logo"
								fill
								sizes="(max-width: 640px) 75vw, (max-width: 768px) 50vw, (max-width: 1536px) 40vw"
								className="absolute"
							/>
						</div>
					</section>
				</ViewportReveal>

				{/* Social Media */}
				<section className="space-y-12 py-16">
					<ViewportReveal asChild>
						<h2 className="text-center font-display text-xl uppercase md:text-2xl">
							Our Social Media
						</h2>
					</ViewportReveal>

					<ViewportReveal asChild>
						<ul className="-mx-4 grid grid-cols-3 grid-rows-3 justify-center gap-1 pb-px text-gray-50 sm:-mx-0 sm:gap-2 md:gap-4 lg:grid-cols-4 lg:grid-rows-2 xl:gap-6">
							<li className="contents">
								<Link
									href="https://www.instagram.com/tv/CXBY_4-A8Nj/"
									className="relative col-span-2 row-span-2 flex aspect-square bg-gray-300"
								>
									<Image
										src="/instagram/1.jpeg"
										alt="An old man contemplating the universe"
										fill
										sizes="(max-width: 640px) 75vw, (max-width: 768px) 50vw, (max-width: 1536px) 40vw"
										className="absolute object-cover object-right"
									/>
									<Icon
										name="play"
										className="relative m-auto w-24 drop-shadow-md md:w-32"
									/>
								</Link>
							</li>

							<li className="contents">
								<Link
									href="https://www.instagram.com/p/ChDP_7ErY60/"
									className="relative aspect-square bg-gray-300"
								>
									<Image
										src="/instagram/2.jpeg"
										alt="A lady standing in front of a brick wall smiling"
										fill
										sizes="(max-width: 640px) 25vw, (max-width: 768px) 25vw, (max-width: 1536px) 20vw"
										className="absolute object-cover object-right"
									/>
								</Link>
							</li>

							<li className="contents">
								<Link
									href="https://www.instagram.com/p/CXIyudXtbCO/"
									className="relative aspect-square bg-gray-300"
								>
									<Image
										src="/instagram/3.jpeg"
										alt="A young woman having a discussion with an elderly woman"
										fill
										sizes="(max-width: 640px) 25vw, (max-width: 768px) 25vw, (max-width: 1536px) 20vw"
										className="absolute object-cover object-right"
									/>
								</Link>
							</li>

							<li className="contents">
								<Link
									href="https://www.instagram.com/tv/CW-ynAOgmYV/"
									className="relative flex aspect-square bg-gray-300"
								>
									<Image
										src="/instagram/4.jpeg"
										alt="An old man in front of a tree having a cordial discussion with someTHING out of frame (maybe aliens)"
										fill
										sizes="(max-width: 640px) 25vw, (max-width: 768px) 25vw, (max-width: 1536px) 20vw"
										className="absolute object-cover object-right"
									/>

									<Icon
										name="play"
										className="relative m-auto w-12 drop-shadow-md md:w-16"
									/>
								</Link>
							</li>

							<li className="contents">
								<Link
									href="https://www.instagram.com/tv/CW8MQwJgw9U/"
									className="relative flex aspect-square bg-gray-300"
								>
									<Image
										src="/instagram/5.jpeg"
										alt="A young man posed awkwardly"
										fill
										sizes="(max-width: 640px) 25vw, (max-width: 768px) 25vw, (max-width: 1536px) 20vw"
										className="absolute object-cover object-right"
									/>

									<Icon
										name="play"
										className="relative m-auto w-12 drop-shadow-md md:w-16"
									/>
								</Link>
							</li>
							<li className="contents">
								<Link
									href="https://www.instagram.com/p/CXHrLZjNvr3/"
									className="relative aspect-square bg-gray-300 lg:hidden"
								>
									<Image
										src="/instagram/6.jpeg"
										alt="A young man with bleached hair visually demonstrating how a praying mantis attacks its prey"
										fill
										sizes="(max-width: 640px) 25vw, (max-width: 768px) 25vw, (max-width: 1536px) 20vw"
										className="absolute object-cover object-right"
									/>
								</Link>
							</li>
						</ul>
					</ViewportReveal>

					<Link
						href="https://www.instagram.com/cccproject767/"
						className="mx-auto flex h-10 w-fit items-center justify-center gap-1 rounded-md border border-gray-700 bg-gray-600 bg-gradient-to-b from-gray-50/10 px-3 font-semibold text-gray-50 shadow-sm hover:from-gray-50/20 active:bg-gradient-to-t active:from-gray-50/10 active:shadow-none"
					>
						<Icon name="instagram" className="w-6" />
						<span>View More on Instagram</span>
					</Link>
				</section>

				<footer className="relative -mx-8 mt-16 flex flex-wrap items-end justify-between gap-4 px-8 py-8 text-gray-50 md:-mx-16">
					<div className="absolute inset-x-0 bottom-0 -z-10 h-[150%]">
						<div className="absolute bottom-0 h-full w-full from-transparent to-gray-950 bg-radial-gradient radial-farthest-side gradient-top mask-gradient-to-b"></div>

						<div className="absolute h-full w-full from-black mask-gradient-to-t">
							<div className="absolute bottom-0 h-[200%] w-full from-transparent to-black radial-farthest-side gradient-top mask-radial-gradient">
								<div className="h-full bg-gray-900 mask-cover mask-luminance mask-center mask-[url(/painted-mask.webp)]"></div>
							</div>
						</div>
					</div>

					<div className="shrink-0 grow">
						<Image
							src={logo}
							alt="Caribbean Cyclone Cartography"
							className="h-12 w-auto object-left opacity-50"
						/>
					</div>

					<p>&copy; Not Primitive 2023</p>

					<ul className="flex shrink-0 grow justify-center gap-4 md:justify-end">
						<li className="contents">
							<Image
								src={goldsmiths}
								alt="Goldsmiths"
								className="h-5 w-auto opacity-50 lg:h-6"
							/>
						</li>
						<li className="contents">
							<Image
								src={gcrf}
								alt="Goldsmiths"
								className="h-5 w-auto opacity-50 lg:h-6"
							/>
						</li>
						<li className="contents">
							<Image
								src={monaGeoinformaticsInstitute}
								alt="Mona Geoinformatics Institute (MGI)"
								className="h-5 w-auto opacity-50 lg:h-6"
							/>
						</li>
					</ul>
				</footer>
			</main>
		</>
	);
}
