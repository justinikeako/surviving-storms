import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
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
    plugin(function ({ addUtilities, matchUtilities }) {
      addUtilities({
        ".radial-circular": {
          "--tw-radial-gradient-shape": "circle",
        },
        ".radial-closest-side": {
          "--tw-radial-gradient-size": "closest-side",
        },
        ".radial-farthest-side": {
          "--tw-radial-gradient-size": "farthest-side",
        },
        ".radial-closest-corner": {
          "--tw-radial-gradient-size": "closest-corner",
        },
        ".radial-farthest-corner": {
          "--tw-radial-gradient-size": "farthest-corner",
        },
      });

      matchUtilities(
        {
          "bg-radial-gradient": (value) => ({
            backgroundImage: `radial-gradient(var(--tw-radial-gradient-shape) var(--tw-radial-gradient-size) at ${value}, var(--tw-gradient-stops))`,
          }),
        },
        {
          values: {
            DEFAULT: "center",
            t: "top",
            tl: "top left",
            tr: "top right",
            r: "right",
            l: "left",
            bl: "bottom left",
            b: "bottom",
            br: "bottom right",
          },
        },
      );
    }),

    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "mask-gradient-to": (value) => ({
            "--tw-mask-gradient-stops":
              "rgb(0 0 0 / var(--tw-mask-from-opacity)) var(--tw-mask-from-position), rgb(0 0 0 / var(--tw-mask-to-opacity)) var(--tw-mask-to-position)",
            maskImage: `linear-gradient(to ${value}, var(--tw-mask-gradient-stops))`,
          }),
        },
        {
          values: {
            tl: "top left",
            t: "top",
            tr: "top right",
            l: "left",
            DEFAULT: "",
            r: "right",
            bl: "bottom left",
            b: "bottom",
            br: "bottom right",
          },
        },
      );

      matchUtilities(
        {
          "mask-radial-gradient": (value) => ({
            "--tw-mask-gradient-stops":
              "rgb(0 0 0 / var(--tw-mask-from-opacity)) var(--tw-mask-from-position), rgb(0 0 0 / var(--tw-mask-to-opacity)) var(--tw-mask-to-position)",
            maskImage: `radial-gradient(var(--tw-radial-gradient-shape) var(--tw-radial-gradient-size) at ${value}, var(--tw-mask-gradient-stops))`,
          }),
        },
        {
          values: {
            DEFAULT: "center",
            t: "top",
            tl: "top left",
            tr: "top right",
            r: "right",
            l: "left",
            bl: "bottom left",
            b: "bottom",
            br: "bottom right",
          },
        },
      );

      matchUtilities(
        {
          "mask-from": (value) => ({
            "--tw-mask-from-opacity": value,
          }),

          "mask-to": (value) => ({
            "--tw-mask-to-opacity": value,
          }),
        },
        {
          values: theme("opacity"),
        },
      );

      matchUtilities(
        {
          "mask-from": (value) => ({
            "--tw-mask-from-position": value,
          }),

          "mask-to": (value) => ({
            "--tw-mask-to-position": value,
          }),
        },
        {
          values: {
            "5%": "5%",
            "10%": "10%",
            "15%": "15%",
            "20%": "20%",
            "25%": "25%",
            "30%": "30%",
            "35%": "35%",
            "40%": "40%",
            "45%": "45%",
            "50%": "50%",
            "55%": "55%",
            "60%": "60%",
            "65%": "65%",
            "70%": "70%",
            "75%": "75%",
            "80%": "80%",
            "85%": "85%",
            "90%": "90%",
            "95%": "95%",
          },
        },
      );
    }),

    plugin(function ({ addUtilities, matchUtilities }) {
      addUtilities({
        ".mask-cover": {
          "mask-size": "cover",
        },
        ".mask-contain": {
          "mask-size": "contain",
        },
        ".mask-luminance": {
          "mask-type": "luminance",
        },
        ".mask-center": {
          "mask-position": "center center",
        },
        ".mask-no-repeat": {
          "mask-repeat": "no-repeat",
        },
      });

      matchUtilities({
        mask: (value) => ({
          maskImage: value,
        }),
      });
    }),
  ]
};

export default config;