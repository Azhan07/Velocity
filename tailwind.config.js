/** VELOCITY design system — colours, fonts and motion tokens live here. */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        void: '#050505', // deepest black — page background
        carbon: '#0b0b0c', // section background
        graphite: '#141416', // cards / surfaces
        steel: '#1f2023', // raised surfaces, borders
        chrome: '#8d9096', // muted text, metallic accents
        silver: '#c9ccd1', // secondary text
        bone: '#f2f0ec', // primary text (warm white)
        racing: {
          DEFAULT: '#e10600', // racing red — use sparingly
          deep: '#9e0400',
          glow: '#ff2a1f',
        },
      },
      fontFamily: {
        display: ['"Unbounded"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { ultra: '0.35em' },
      transitionTimingFunction: { cine: 'cubic-bezier(0.77, 0, 0.175, 1)' },
      keyframes: {
        scan: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        pulseRed: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(225,6,0,0.55)' },
          '50%': { boxShadow: '0 0 0 10px rgba(225,6,0,0)' },
        },
      },
      animation: {
        scan: 'scan 2.4s cubic-bezier(0.77,0,0.175,1) infinite',
        marquee: 'marquee 40s linear infinite',
        pulseRed: 'pulseRed 2.2s ease-out infinite',
      },
    },
  },
  plugins: [],
};
