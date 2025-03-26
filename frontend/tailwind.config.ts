import {nextui} from '@nextui-org/theme';
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
	darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{css,js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/navbar.js"
  ],
	theme: {
		extend: {
			screens: {
				'2sm': '370px',
			},
			fontFamily: {
				sans: ["var(--font-sans)", ...fontFamily.sans]
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				tertiary: {
					DEFAULT: 'hsl(var(--tertiary))',
					foreground: 'hsl(var(--tertiary-foreground))'
				},
				default: {
					DEFAULT: 'hsl(var(--default))',
					foreground: 'hsl(var(--default-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				accentdark: {
					DEFAULT: 'hsl(var(--accent-dark))',
					foreground: 'hsl(var(--accent-dark-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				fondodark: {
					DEFAULT: 'hsl(var(--fondo-dark-default))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
			},
			fontSize: {
				'h1-extrabold': ['50px', { fontWeight: '800' }],
				'h1-bold': ['35px', { fontWeight: '700' }],
				'h1-semibold': ['30px', { fontWeight: '600' }],
				'h1-regular': ['25px', { fontWeight: '400' }],
				'h2-bold': ['40px', { fontWeight: '700' }],
				'h2-semibold': ['35px', { fontWeight: '600' }],
				'h2-medium': ['30px', { fontWeight: '500' }],
				'body-bold': ['30px', { letterSpacing: '0px', fontWeight: '700' }], // Bold
				'body-semi-bold': ['30px', { letterSpacing: '0px', fontWeight: '600' }], // SemiBold
				'body-medium': ['30px', { letterSpacing: '0px', fontWeight: '500' }], // Medium
				'body-regular': ['25px', { letterSpacing: '0px', fontWeight: '400' }], // Regular
			},
			gridTemplateRows: {
				layout: 'auto 2fr auto',
			},
			gridTemplateColumns: {
				layout: '100dvw',
			},
			maxWidth: {
				layout: '100dvw',
			},
		},
	},
  plugins: [tailwindcssAnimate,typography,nextui()],
}

export default config
