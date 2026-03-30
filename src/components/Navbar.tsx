import { useState, useEffect } from "react"
import { logoRestaurante, hamburguer } from "../assets/logo"
import NAV_LINKS from "../assets/constants/Navlinks"

const Navbar = () => {
  const [scrolled,   setScrolled]   = useState(false)
  const [hidden,     setHidden]     = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [activeHref, setActiveHref] = useState("")

  /* ── Detectar scroll: shrink + hide/show ── */
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      setHidden(y > 300 && y > lastY)
      lastY = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* ── Detectar sección activa ── */
  useEffect(() => {
    const onScroll = () => {
      for (const link of [...NAV_LINKS].reverse()) {
        const el = document.querySelector(link.href)
        if (!el) continue
        if (el.getBoundingClientRect().top <= 100) {
          setActiveHref(link.href)
          return
        }
      }
      setActiveHref("")
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* ── Bloquear scroll del body cuando el menú está abierto ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* ── Header ── */}
      <header className={`navbar-header${scrolled ? " navbar-header--scrolled" : ""}${hidden ? " navbar-header--hidden" : ""}`}>
        <div className="navbar-inner">

          {/* Logo */}
          <a href="#hero" className="navbar-logo" onClick={closeMenu}>
            <img src={logoRestaurante} alt="Leña Quiteña" width={100} height={100} className="rounded-full" />
            <span className="navbar-logo-text hidden sm:block">Leña Quiteña</span>
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
             <ul className="navbar-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`navbar-link${activeHref === link.href ? " navbar-link--active" : ""}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          </div>

          {/* Links desktop */}
         

          {/* CTA desktop */}
          

          {/* Botón hamburguesa */}
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
          >
            {/* Ícono hamburguesa — se oculta al abrir */}
            <img
              src={hamburguer}
              alt=""
              aria-hidden="true"
              width={25}
              height={25}
              style={{
                transition: "opacity 0.25s, transform 0.25s",
                opacity:    menuOpen ? 0 : 1,
                transform:  menuOpen ? "rotate(90deg) scale(0.7)" : "rotate(0deg) scale(1)",
                position:   "absolute",
              }}
            />
            {/* Ícono X — aparece al abrir */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              width={25}
              height={25}
              aria-hidden="true"
              style={{
                color:      "#F5EDD8",
                transition: "opacity 0.25s, transform 0.25s",
                opacity:    menuOpen ? 1 : 0,
                transform:  menuOpen ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.7)",
                position:   "absolute",
              }}
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

        </div>
      </header>

      {/* ── Backdrop ── */}
      <div
        className={`mobile-backdrop${menuOpen ? " mobile-backdrop--open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ── Drawer ── */}
      <nav
        id="mobile-drawer"
        className={`mobile-drawer${menuOpen ? " mobile-drawer--open" : ""}`}
        aria-label="Menú móvil"
      >
        <ul className="mobile-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="mobile-link-item">
              <a
                href={link.href}
                onClick={closeMenu}
                className={`mobile-link${activeHref === link.href ? " mobile-link--active" : ""}`}
              >
                <span className="mobile-link-bullet" aria-hidden="true" />
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#reservaciones" onClick={closeMenu} className="mobile-cta">
          Hacer Reserva
        </a>

        <p className="mobile-tagline">El Sabor de la Memoria</p>
      </nav>
    </>
  )
}

export default Navbar