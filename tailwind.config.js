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
                // Brand palettes (light/dark) — exposed for utilities
                brand: {
                    dark: {
                        bg: '#37353E',    // dark background
                        surface: '#44444E',
                        text: '#D3DAD9',
                    },
                    light: {
                        text: '#B6AE9F',
                        surface: '#DEDED1',
                        bg: '#FBF3D1',
                    }
                },
                // keep existing useful tokens
                primary: {
                    DEFAULT: '#4F46E5',
                    dark: '#6366F1',
                },
                secondary: {
                    DEFAULT: '#F59E42',
                    dark: '#FBBF24',
                },
            },
            borderRadius: {
                DEFAULT: '0.75rem',
                sm: '0.375rem',
                md: '0.5rem',
                lg: '0.75rem',
                xl: '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
        },
    },
    plugins: [],
}
