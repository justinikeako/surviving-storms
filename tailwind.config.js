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

			aspectRatio: {
				document: '1 / 1.414',
			},
		},
	},

	plugins: [
		plugin(function ({ addUtilities }) {
			addUtilities({
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
				'.gradient-top': {
					'--tw-bg-radial-gradient-position': 'center top',
				},

				'.mask-radial-gradient': {
					'--tw-bg-radial-gradient-size-and-position':
						'var(--tw-bg-radial-gradient-size) at var(--tw-bg-radial-gradient-position)',
					'mask-image':
						'radial-gradient(var(--tw-bg-radial-gradient-size-and-position), var(--tw-gradient-stops))',
				},
				'.mask-circular-gradient': {
					'--tw-bg-radial-gradient-size-and-position':
						'circle var(--tw-bg-radial-gradient-size) at var(--tw-bg-radial-gradient-position)',
					'mask-image':
						'radial-gradient(var(--tw-bg-radial-gradient-size-and-position), var(--tw-gradient-stops))',
				},

				'.mask-gradient-to-b': {
					'mask-image': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
				},
				'.mask-gradient-to-t': {
					'mask-image': 'linear-gradient(to top, var(--tw-gradient-stops))',
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
				'.mask-luminance': {
					'mask-type': 'luminance',
				},
				'.mask-center': {
					'mask-position': 'center center',
				},
				'.mask-no-repeat': {
					'mask-repeat': 'no-repeat',
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
