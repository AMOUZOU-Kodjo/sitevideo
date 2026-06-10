export default function LogoSvg({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="8" fill="url(#logo-gradient)" />
      <text
        x="18"
        y="24"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        SB
      </text>
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="36" y2="36">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
