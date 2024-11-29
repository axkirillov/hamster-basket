/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{vue,js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			keyframes: {
				wiggle: {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(-5deg)' },
					'75%': { transform: 'rotate(5deg)' },
				}
			},
			animation: {
				wiggle: 'wiggle 0.3s ease-in-out',
			}
		},
	},
	plugins: [],
}

