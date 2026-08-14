/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // App-level palette (kid-friendly, warm, WCAG-AA contrast)
        cream: '#FFF8F0',
        primary: {
          DEFAULT: '#FF7A45',
          dark: '#E85F2C',
          light: '#FFB088',
        },
        secondary: '#36CFC9',
        accent: '#FFD43B',

        // Word-category color tokens (used by WordCard, highlights, etc.)
        cat: {
          time: '#3B82F6',          // blue
          idiom_action: '#10B981', // green
          idiom_mood: '#10B981',
          idiom_result: '#10B981',
          idiom_scene: '#10B981',
          thing: '#F59E0B',        // amber
          verb: '#EF4444',         // red
          person: '#8B5CF6',       // purple
          place: '#06B6D4',        // cyan
          adjective: '#EC4899',    // pink
          adverb: '#A855F7',       // violet
          conjunction: '#64748B',  // slate
          measure: '#84CC16',      // lime
          pronoun: '#94A3B8',      // lighter slate
        },
      },
      fontFamily: {
        zh: ['"Noto Sans TC"', '"PingFang TC"', '"Microsoft JhengHei"', 'system-ui', 'sans-serif'],
        zhSerif: ['"Noto Serif TC"', '"PMingLiU"', 'serif'],
      },
      fontSize: {
        'zh-base': ['1rem', { lineHeight: '1.7' }],
        'zh-lg': ['1.25rem', { lineHeight: '1.6' }],
        'zh-xl': ['1.5rem', { lineHeight: '1.5' }],
        'zh-2xl': ['1.875rem', { lineHeight: '1.4' }],
        'zh-3xl': ['2.25rem', { lineHeight: '1.3' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        card: '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
        pop: '0 12px 32px rgba(255,122,69,0.25)',
      },
      keyframes: {
        'spring-in': {
          '0%': { transform: 'scale(0.85) translateY(8px)', opacity: '0' },
          '60%': { transform: 'scale(1.05) translateY(-2px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,212,59,0.6)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255,212,59,0)' },
        },
        'confetti-pop': {
          '0%': { transform: 'scale(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        'spring-in': 'spring-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'confetti-pop': 'confetti-pop 1.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}