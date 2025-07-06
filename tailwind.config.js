module.exports = {
    darkMode: 'class',
    content: [
        './components/**/*.{vue,js,ts}',
        './src/**/*.{vue,js,ts,css}',
        './app.vue',
        './pages/**/*.{vue,js,ts}',
        './assets/**/*.{css,vue,js,ts}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4F46E5', // Indigo-600
                    dark: '#6366F1',   // Indigo-500
                },
                secondary: {
                    DEFAULT: '#F59E42', // Orange-400
                    dark: '#FBBF24',   // Yellow-400
                },
                background: {
                    DEFAULT: '#FFFFFF',
                    dark: '#181A1B',
                },
                surface: {
                    DEFAULT: '#F3F4F6', // Gray-100
                    dark: '#232526',
                },
                accent: {
                    DEFAULT: '#10B981', // Emerald-500
                    dark: '#34D399',   // Emerald-400
                },
                text: {
                    DEFAULT: '#18181B', // Gray-900
                    dark: '#F3F4F6',   // Gray-100
                },
            },
        },
    },
    plugins: [],
}
