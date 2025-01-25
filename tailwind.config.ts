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
          DEFAULT: '#9b87f5',
          foreground: '#FFFFFF',
          thick: '#8E9196'
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
          DEFAULT: '#1A1F2C',
          foreground: '#FFFFFF'
        },
        sidebar: {
          DEFAULT: '#1A1F2C',
          foreground: '#FFFFFF',
          primary: '#9b87f5',
          'primary-foreground': '#FFFFFF',
          accent: '#E5DEFF',
          'accent-foreground': '#1A1F2C',
          border: '#403E43',
          ring: '#9b87f5'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;