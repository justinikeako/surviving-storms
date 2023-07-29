import './globals.css';
import type { Metadata } from 'next';
import { Header } from '~/components/header';
import { Assistant, Bebas_Neue } from 'next/font/google';
import { cn } from '~/lib/utils';

const bebasNeue = Bebas_Neue({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-display',
});
const assistant = Assistant({ subsets: ['latin'], variable: '--font-base' });

export const metadata: Metadata = {
	title: 'Surviving Storms',
	description: 'Mapping Hurricane Hazards, Survivals, and Repair in Dominica',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				className={cn(
					'bg-gray-100 text-gray-800 selection:bg-yellow-600 selection:text-gray-50',
					assistant.variable,
					bebasNeue.variable,
				)}
			>
				<Header />

				{children}
			</body>
		</html>
	);
}
