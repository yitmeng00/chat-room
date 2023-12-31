/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
    content: ["./index.html", "./client.js", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Proxima Nova"', ...defaultTheme.fontFamily.sans],
            },
            backgroundImage: {
                gradient:
                    "linear-gradient(to right top, #051937, #004d7a, #008793, #00bf72, #a8eb12)",
            },
        },
    },
    plugins: [],
};
