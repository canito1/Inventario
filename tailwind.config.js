/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Copilot design system fonts
        sans: ['Ginto', 'system-ui', 'sans-serif'],
        heading: ['GintoNord', 'Ginto', 'system-ui', 'sans-serif'],
        display: ['GintoNord', 'Ginto', 'system-ui', 'sans-serif'],
        mono: ['CascadiaCode', 'ui-monospace', 'monospace'],
      },
      screens: {
        xs: '360px',
        sm: '32rem',    // 512px
        md: '48rem',    // 768px
        lg: '60rem',    // 960px
        xl: '66rem',    // 1058px
        '2xl': '86.25rem', // 1380px
      },
      colors: {
        // Copilot palette — direct hex values for inline use
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-foreground': 'var(--surface-foreground)',
        'text-primary': 'var(--foreground)',
        'text-muted': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        border: 'var(--border)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--destructive)',
        info: 'var(--info)',

        // Extended palette
        'copilot-gray-100': '#c7c7c7',
        'copilot-gray-200': '#f2f2f2',
        'copilot-gray-300': '#262626',
        'copilot-gray-400': '#f98880',
        'copilot-gray-500': '#97abea',
        'copilot-gray-600': '#121212',
        'copilot-gray-700': '#6cc57b',
        'copilot-gray-800': '#9da8d9',
        'copilot-gray-900': '#333a4e',
        'copilot-gray-950': '#9d1920',

        // Tailwind CSS-variable tokens (shadcn/ui compatible)
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--surface-foreground)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar-background)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
        none: '0',
        sm: '2px',       // .125rem
        md: '4px',       // .25rem
        lg: '6px',       // .375rem
        xl: '8px',       // .5rem
        '2xl': '10px',   // .625rem
        '3xl': '12px',   // .75rem
        '4xl': '16px',   // 1rem
        full: '9999px',
        // Copilot scale
        'copilot-xs': '1px',
        'copilot-sm': '2px',
        'copilot-md': '4px',
        'copilot-lg': '6px',
        'copilot-xl': '8px',
        'copilot-2xl': '10px',
        'copilot-3xl': '12px',
        'copilot-4xl': '14px',
        'copilot-5xl': '16px',
        'copilot-6xl': '18px',
        'copilot-7xl': '20px',
        'copilot-8xl': '24px',
        'copilot-9xl': '26px',
        'copilot-10xl': '28px',
        'copilot-11xl': '32px',
        'copilot-12xl': '36px',
        'copilot-13xl': '40px',
        'copilot-14xl': '48px',
        'copilot-15xl': '60px',
      },
      boxShadow: {
        // Copilot uses flat elevation - no shadows
        'copilot-none': 'none',
        'copilot-flat': 'none',
        'copilot-raised': 'none',
        'copilot-overlay': 'none',
        'copilot-card': 'none',
      },
      spacing: {
        // 4px base grid - all values are multiples of 4
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '13': '52px',
        '14': '56px',
        '15': '60px',
        '16': '64px',
        '18': '72px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '44': '176px',
        '48': '192px',
        '52': '208px',
        '56': '224px',
        '60': '240px',
        '64': '256px',
        '72': '288px',
        '80': '320px',
        '96': '384px',
      },
      fontSize: {
        // Copilot type scale
        'heading-1': ['80px', { lineHeight: '1.2', fontWeight: '700', fontFamily: 'GintoNord' }],
        'heading-2': ['60px', { lineHeight: '1.2', fontWeight: '700', fontFamily: 'GintoNord' }],
        'heading-3': ['52px', { lineHeight: '1.2', fontWeight: '700', fontFamily: 'GintoNord' }],
        'heading-4': ['32px', { lineHeight: '1.2', fontWeight: '700', fontFamily: 'GintoNord' }],
        'heading-5': ['24px', { lineHeight: '1.2', fontWeight: '700', fontFamily: 'GintoNord' }],
        'heading-6': ['18px', { lineHeight: '1.2', fontWeight: '700', fontFamily: 'GintoNord' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400', fontFamily: 'GintoNord' }],
        'caption': ['20px', { lineHeight: '1.5', fontWeight: '400', fontFamily: 'Ginto' }],
        'code': ['14px', { lineHeight: '1.5', fontWeight: '400', fontFamily: 'CascadiaCode' }],
      },
      transitionDuration: {
        '0': '0ms',
        '50': '50ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
        '750': '750ms',
        '1000': '1000ms',
      },
      transitionTimingFunction: {
        'copilot': 'cubic-bezier(0.06, 0.17, 0.36, 1.26)',
        'copilot-ease-out': 'ease-out',
        'copilot-ease-in': 'ease-in',
        'copilot-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'scroll-fade': 'scroll-fade 1s ease-out forwards',
        'scroll-fade-x-end': 'scroll-fade-x-end 1s ease-out forwards',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.06, 0.17, 0.36, 1.26)',
        'shimmer': 'shimmer 2s infinite',
        'caret-blink': 'caret-blink 1s ease-in-out infinite',
        'dot-bounce': 'dotBounce 1.4s infinite ease-in-out',
        'dot-pulse': 'dotPulse 1.4s infinite ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'scroll-fade': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'scroll-fade-x-end': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'caret-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'dotBounce': {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        'dotPulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.5)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      zIndex: {
        '0': '0',
        '1': '1',
        '5': '5',
        '10': '10',
        '20': '20',
        '30': '30',
        '35': '35',
        '40': '40',
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
        '100': '100',
      },
      maxWidth: {
        'container': '1060px',
      },
    },
  },
  plugins: [],
}