/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        tavern: {
          wood: "#6b4f2a",
          brass: "#b08d57",
          velvet: "#2b1e1a",
          glow: "#ffd27d"
        }
      },
      fontFamily: {
        'geist': ['Geist', 'sans-serif'],
        'geist-mono': ['Geist Mono', 'monospace'],
        'pacifico': ['Pacifico', 'cursive'],
      },
      boxShadow: {
        deep: "inset 0 2px 6px rgba(0,0,0,0.6), 0 6px 16px rgba(0,0,0,0.6)",
        bevel: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.4), 0 8px 14px rgba(0,0,0,0.75)"
      },
      animation: {
        pop: 'pop 300ms ease-out',
        shimmer: 'shimmer 2.5s infinite',
        rumble: 'rumble 200ms ease-in-out'
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        shimmer: {
          '0%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.2)' },
          '100%': { filter: 'brightness(1)' }
        },
        rumble: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' }
        }
      }
    },
  },
  plugins: [],
}
