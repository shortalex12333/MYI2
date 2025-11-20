import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // NEW BRAND: Technical Precision Colors (inspired by 21st.dev)
        brand: {
          // Primary Signal Blue
          blue: '#0070FF',
          'blue-secondary': '#00A4FF',
          // Backgrounds
          'ghost-white': '#F8F8F0',
          'engine-black': '#181818',
          'chart-grey': '#E5E5E5',
          // Accent & State Colors
          'seafoam-green': '#10B981',
          'signal-orange': '#F97316',
          // Ice Gradient (use in CSS as linear-gradient)
          'ice-start': '#BADDE9',
          'ice-end': '#2FB9E8',
        },
        // LEGACY: Premium Maritime Yacht Colors (deprecated - will be removed)
        maritime: {
          navy: '#071C2F',
          'navy-light': '#0F2F45',
          ocean: '#2E5266',
          teal: '#77A6B6',
          gold: '#D4AF37',
          'gold-light': '#E5C158',
          cream: '#F3F0EB',
          silver: '#C0C0C0',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        // NEW BRAND: Technical precision animations (200ms timing)
        'fade-in': 'fade-in 0.2s ease-in',
        'fade-up-fast': 'fade-up-fast 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        // LEGACY: Maritime animations (deprecated)
        'aurora': 'aurora 60s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 8s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        // NEW BRAND keyframes
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up-fast': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5', boxShadow: '0 0 20px rgba(0, 112, 255, 0.3)' },
          '50%': { opacity: '1', boxShadow: '0 0 40px rgba(0, 112, 255, 0.6)' },
        },
        // LEGACY keyframes
        aurora: {
          '0%, 100%': {
            transform: 'rotate(0deg) scale(1)',
            opacity: '0.3',
          },
          '50%': {
            transform: 'rotate(180deg) scale(1.2)',
            opacity: '0.5',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0%)' },
          '50%': { transform: 'translateX(10%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      spacing: {
        '80': '20rem', // 320px - new brand section spacing
        '120': '30rem', // 480px - hero spacing
      },
      fontFamily: {
        display: ['Eloquia Display', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
