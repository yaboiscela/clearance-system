// tailwind.config.js
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
        fontFamily: {
            sans: ['Inter', 'sans-serif'], // Example default font
        },
        },
    },
    plugins: [],
};
