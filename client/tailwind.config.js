/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // iOS system grays (light mode)
        ink: {
          900: '#1c1c1e',  // label
          700: '#3a3a3c',  // secondaryLabel
          500: '#8e8e93',  // tertiaryLabel
          300: '#c7c7cc',  // separator
          200: '#d1d1d6',  // opaqueSeparator
          100: '#e5e5ea',  // tertiarySystemFill
          50:  '#f2f2f7',  // systemGroupedBackground (page bg)
        },
        // iOS semantic fills
        fill: {
          primary:    '#ffffff',              // systemBackground / card surface
          secondary:  '#f2f2f7',             // systemGroupedBackground
          tertiary:   '#ffffff',             // secondarySystemGroupedBackground
          input:      'rgba(120,120,128,0.12)', // iOS text field fill (systemFill)
        },
        // iOS system colors (light mode)
        blue:    '#007aff',
        red:     '#ff3b30',
        green:   '#34c759',
        orange:  '#ff9500',
        yellow:  '#ffcc00',
        purple:  '#af52de',
        teal:    '#5ac8fa',
      },
      borderRadius: {
        ios:   '10px',
        card:  '12px',
        sheet: '20px',
      },
      boxShadow: {
        card:   '0 1px 0 rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.04)',
        sheet:  '0 4px 16px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
        nav:    '0 0.5px 0 rgba(0,0,0,0.16)',
      },
      fontSize: {
        // iOS Dynamic Type equivalents (fixed for web)
        'large-title': ['34px', { lineHeight: '1.18', letterSpacing: '0.4px', fontWeight: '700' }],
        'title-1':     ['28px', { lineHeight: '1.22', letterSpacing: '0.36px', fontWeight: '700' }],
        'title-2':     ['22px', { lineHeight: '1.27', letterSpacing: '0.35px', fontWeight: '700' }],
        'title-3':     ['20px', { lineHeight: '1.3',  letterSpacing: '0.38px', fontWeight: '600' }],
        'headline':    ['17px', { lineHeight: '1.29', letterSpacing: '-0.408px', fontWeight: '600' }],
        'body':        ['17px', { lineHeight: '1.29', letterSpacing: '-0.408px', fontWeight: '400' }],
        'callout':     ['16px', { lineHeight: '1.31', letterSpacing: '-0.32px',  fontWeight: '400' }],
        'subhead':     ['15px', { lineHeight: '1.33', letterSpacing: '-0.24px',  fontWeight: '400' }],
        'footnote':    ['13px', { lineHeight: '1.38', letterSpacing: '-0.078px', fontWeight: '400' }],
        'caption-1':   ['12px', { lineHeight: '1.33', letterSpacing: '0px',      fontWeight: '400' }],
        'caption-2':   ['11px', { lineHeight: '1.18', letterSpacing: '0.066px',  fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};
