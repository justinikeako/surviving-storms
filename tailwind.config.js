const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],

	future: {
		hoverOnlyWhenSupported: true,
	},

	theme: {
		fontFamily: {
			display: ['var(--font-display)'],
			base: ['var(--font-base)'],
		},
		extend: {
			screens: {
				xs: '420px',
			},

			lineHeight: {
				tight: '1.15',
			},

			container: {
				center: true,
			},
		},
	},

	plugins: [
		plugin(function ({ addUtilities }) {
			addUtilities({
				'.radial-closest-side': {
					'--tw-bg-radial-gradient-size': 'closest-side',
				},
				'.radial-farthest-side': {
					'--tw-bg-radial-gradient-size': 'farthest-side',
				},
				'.radial-closest-corner': {
					'--tw-bg-radial-gradient-size': 'closest-corner',
				},
				'.radial-farthest-corner': {
					'--tw-bg-radial-gradient-size': 'farthest-corner',
				},

				'.gradient-bottom': {
					'--tw-bg-radial-gradient-position': 'center bottom',
				},

				'.gradient-bottom-left': {
					'--tw-bg-radial-gradient-position': 'left bottom',
				},

				'.mask-radial-gradient': {
					'--tw-bg-radial-gradient-size-and-position':
						'var(--tw-bg-radial-gradient-size) at var(--tw-bg-radial-gradient-position)',
					'mask-image':
						'radial-gradient(var(--tw-bg-radial-gradient-size-and-position), var(--tw-gradient-stops))',
				},
				'.bg-radial-gradient': {
					'--tw-bg-radial-gradient-size-and-position':
						'var(--tw-bg-radial-gradient-size) at var(--tw-bg-radial-gradient-position)',
					'background-image':
						'radial-gradient(var(--tw-bg-radial-gradient-size-and-position), var(--tw-gradient-stops))',
				},
				'.bg-circular-gradient': {
					'--tw-bg-radial-gradient-size-and-position':
						'circle var(--tw-bg-radial-gradient-size) at var(--tw-bg-radial-gradient-position)',
					'background-image':
						'radial-gradient(var(--tw-bg-radial-gradient-size-and-position), var(--tw-gradient-stops))',
				},
			});
		}),
		plugin(function ({ addUtilities, matchUtilities }) {
			addUtilities({
				'.mask-cover': {
					'mask-size': 'cover',
				},
				'.mask-contain': {
					'mask-size': 'contain',
				},
			});

			matchUtilities({
				mask: (value) => ({
					maskImage: value,
				}),
			});
		}),
	],
};
