/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      padding: {
        'gap': '10px',
      },
      margin: {
        'gap': '10px',
      },
      translate: {
        'notification': '600px',
      },
      colors: {
        'board-bg-color': '#0079bf',
        'navbar-app-bg-color': '#0067a3',
        'navbar-board-bg-color': '#0079bf',
        'list-bg-color': '#ebecf0',
        'app-main-color': '#333',
        'border-color': '#ebecf04b',
        'hover-sidebar': '#ebecf060',
        'hover-icon': '#ffffff1a',
        'hover-button': '#bdbdbd9d',
      },
    },
  },
  plugins: [],
};
