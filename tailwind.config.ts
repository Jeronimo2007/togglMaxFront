import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      colors: {

        calendar: {
          'event-bg': 'rgb(174 119 205)',         // Color de fondo del evento
          'event-border': 'rgba(172, 117, 203, 0.5)', // Color del borde del evento
          'grid-border': 'rgba(63, 52, 103, 0.2)',    // Color del borde de la grilla
        },
        border: 'rgb(63,52,103) ', // Texto secundario
        input: '#A77EC7', // Texto secundario
        ring: '#F79AFF', // Destacados y líneas
        background: '#1E0E2F', // Fondo principal
        foreground: '#E4CFF7', // Texto principal
        primary: {
          DEFAULT: '#F79AFF', // Destacados y líneas
          foreground: '#1E0E2F' // Fondo principal
        },
        secondary: {
          DEFAULT: '#A77EC7', // Texto secundario
          foreground: '#1E0E2F' // Fondo principal
        },
        destructive: {
          DEFAULT: '#F79AFF', // Destacados y líneas
          foreground: '#1E0E2F' // Fondo principal
        },
        muted: {
          DEFAULT: '#2C113A', // Paneles secundarios
          foreground: '#A77EC7' // Texto secundario
        },
        accent: {
          DEFAULT: '#F79AFF', // Destacados y líneas
          foreground: '#1E0E2F' // Fondo principal
        },
        popover: {
          DEFAULT: '#2C113A', // Paneles secundarios
          foreground: '#E4CFF7' // Texto principal
        },
        card: {
          DEFAULT: '#2C113A', // Paneles secundarios
          foreground: '#E4CFF7' // Texto principal
        },
        chart: {
          '1': '#F79AFF', // Chart color 1
          '2': '#A77EC7', // Chart color 2
          '3': '#E4CFF7', // Chart color 3
          '4': '#2C113A', // Chart color 4
          '5': '#1E0E2F' // Chart color 5
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
}

export default config