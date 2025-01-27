import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: '#1A1F2C',
        foreground: '#FFFFFF',
        primary: {
          DEFAULT: '#4F46E5',
          foreground: '#FFFFFF',
          light: '#818CF8'
        },
        secondary: {
          DEFAULT: '#403E43',
          foreground: '#FFFFFF',
          thick: '#D6BCFA'
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#8E9196',
          foreground: '#D6BCFA',
          thick: '#403E43'
        },
        accent: {
          DEFAULT: '#E5DEFF',
          foreground: '#1A1F2C',
          thick: '#F1F0FB'
        },
        popover: {
          DEFAULT: '#1A1F2C',
          foreground: '#FFFFFF'
        },
        card: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          foreground: '#FFFFFF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out'
      },
      backdropBlur: {
        xs: '2px',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;