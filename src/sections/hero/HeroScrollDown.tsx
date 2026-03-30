const HeroScrollDown = () => {
  return (
    <a
      href="#historia"
      aria-label="Ir a la sección Historia"
      className="hero-scroll-down"
    >
      <span className="hero-scroll-label">Descubrir</span>
      <svg
        width="16"
        height="10"
        viewBox="0 0 16 10"
        fill="none"
        aria-hidden="true"
        className="hero-scroll-arrow"
      >
        <path
          d="M1 1L8 8L15 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  )
}

export default HeroScrollDown