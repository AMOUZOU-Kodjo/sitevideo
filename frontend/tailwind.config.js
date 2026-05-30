/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#4f46e5',
          'primary-content': '#ffffff',
          'secondary': '#7c3aed',
          'secondary-content': '#ffffff',
          'accent': '#f59e0b',
          'accent-content': '#1c1917',
          'neutral': '#1e293b',
          'neutral-content': '#f8fafc',
          'base-100': '#ffffff',
          'base-200': '#f1f5f9',
          'base-300': '#e2e8f0',
          'base-content': '#1e293b',
          'info': '#0ea5e9',
          'info-content': '#ffffff',
          'success': '#10b981',
          'success-content': '#ffffff',
          'warning': '#f59e0b',
          'warning-content': '#1c1917',
          'error': '#ef4444',
          'error-content': '#ffffff',
          '--rounded-btn': '0.625rem',
          '--rounded-box': '0.75rem',
          '--rounded-badge': '9999px',
          '--animation-btn': '0.2s',
          '--btn-text-case': 'none',
          '--btn-focus-scale': '0.97',
          '--tab-radius': '0.5rem'
        },
        dark: {
          'primary': '#6366f1',
          'primary-content': '#ffffff',
          'secondary': '#8b5cf6',
          'secondary-content': '#ffffff',
          'accent': '#f59e0b',
          'accent-content': '#1c1917',
          'neutral': '#f1f5f9',
          'neutral-content': '#0f172a',
          'base-100': '#0f172a',
          'base-200': '#1e293b',
          'base-300': '#334155',
          'base-content': '#e2e8f0',
          'info': '#38bdf8',
          'info-content': '#0f172a',
          'success': '#22c55e',
          'success-content': '#0f172a',
          'warning': '#f59e0b',
          'warning-content': '#1c1917',
          'error': '#ef4444',
          'error-content': '#ffffff',
          '--rounded-btn': '0.625rem',
          '--rounded-box': '0.75rem',
          '--rounded-badge': '9999px',
          '--animation-btn': '0.2s',
          '--btn-text-case': 'none',
          '--btn-focus-scale': '0.97',
          '--tab-radius': '0.5rem'
        }
      }
    ]
  }
}
