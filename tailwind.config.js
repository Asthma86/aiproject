/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === НАШИ НОВЫЕ СЕМАНТИЧЕСКИЕ ЦВЕТА ДЛЯ ЧАТА ===
        background: '#1A1A2E', 
        surface: '#1E1E2E',    
        panel: '#2D2D3F',      
        input: '#2A2A3A',      
        
        divider: {
          DEFAULT: '#3A3A4A',
          hover: '#444453',
        },
        
        primary: {
          DEFAULT: '#6C5CE7',
          foreground: 'hsl(var(--primary-foreground))', // Оставили для совместимости с shadcn
          hover: '#7D6EF0',
          active: '#5B4DD6',
        },
        
        content: {
          DEFAULT: '#F7F7FF',
          secondary: '#E0E0E0',
          tertiary: '#B8B8C0',
          muted: '#8D8D99',
          dark: '#33363F',
        },
        
        danger: '#FF6B6B',

        // === СИСТЕМНЫЕ ЦВЕТА (Оставлены для совместимости с другими UI-компонентами) ===
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))', // Встроенный muted от UI-библиотеки
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        chat: {
          sidebar: 'hsl(var(--chat-sidebar))',
          main: 'hsl(var(--chat-main))',
          purple: 'hsl(var(--chat-purple))',
          inputBg: 'hsl(var(--chat-input-bg))',
          barBg: 'hsl(var(--chat-bar-bg))',
          muted: 'hsl(var(--chat-muted))',
          label: 'hsl(var(--chat-label))',
          divider: 'hsl(var(--chat-divider))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // === НАШИ КАСТОМНЫЕ АНИМАЦИИ (без изменений) ===
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeInMessage: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInBg: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        popUpPanel: {
          from: { opacity: '0', transform: 'translateY(15px) scale(0.98)' },
          to: { transform: 'translateY(0) scale(1)' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        iconPop: {
          from: { opacity: '0', transform: 'scale(0.5) rotate(-10deg)' },
          to: { opacity: '1', transform: 'scale(1) rotate(0)' },
        },
        slideInChat: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutChat: {
          from: { opacity: '1', transform: 'translateX(0) scale(1)', maxHeight: '50px', marginBottom: '0.25rem' },
          to: { opacity: '0', transform: 'translateX(-20px) scale(0.9)', maxHeight: '0', marginBottom: '0', padding: '0', border: 'none' },
        },
        popInMenu: {
          from: { opacity: '0', transform: 'scale(0.95) translateY(-5px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        popOutPanel: {
          from: { opacity: '1', transform: 'translateY(0) scale(1)' },
          to: { opacity: '0', transform: 'translateY(15px) scale(0.98)' },
        },
        slideOutImg: {
          '0%': { opacity: '1', transform: 'scale(1)', width: '5rem' },
          '40%': { opacity: '0', transform: 'scale(0.8)', width: '5rem' },
          '100%': { opacity: '0', transform: 'scale(0.5)', width: '0', marginRight: '-0.5rem', padding: '0', border: 'none' },
        },
        slideOutFile: {
          '0%': { opacity: '1', transform: 'translateX(0)', maxHeight: '50px', paddingTop: '0.5rem', paddingBottom: '0.5rem' },
          '40%': { opacity: '0', transform: 'translateX(-10px)', maxHeight: '50px', paddingTop: '0.5rem', paddingBottom: '0.5rem' },
          '100%': { opacity: '0', transform: 'translateX(-10px)', maxHeight: '0', paddingTop: '0', paddingBottom: '0', borderColor: 'transparent', overflow: 'hidden' },
        }
      },
      animation: {
        'drawer': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'message': 'fadeInMessage 0.3s ease-out forwards',
        'bg': 'fadeInBg 0.3s ease-out forwards',
        'panel': 'popUpPanel 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-slide': 'fadeSlideUp 0.3s ease-out forwards',
        'icon': 'iconPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'chat-enter': 'slideInChat 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'chat-exit': 'slideOutChat 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'menu': 'popInMenu 0.2s ease-out forwards',
        'panel-exit': 'popOutPanel 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'img-exit': 'slideOutImg 0.3s ease-out forwards',
        'file-exit': 'slideOutFile 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}