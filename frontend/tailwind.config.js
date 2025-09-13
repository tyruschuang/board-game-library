import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)"],
                mono: ["var(--font-mono)"],
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(-0.25deg)' },
                    '50%': { transform: 'translateY(-8px) rotate(0.25deg)' },
                },
            },
            animation: {
                'float-slow': 'float 8s ease-in-out infinite',
            },
        },
    },
    darkMode: "class",
    plugins: [heroui()],
}

module.exports = config;
