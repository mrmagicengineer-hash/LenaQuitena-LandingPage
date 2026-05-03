import { useState, useEffect } from "react"
import { logoGeneral, hamburguer } from "../assets/logo"
import NAV_LINKS from "../assets/constants/Navlinks"
import { LanguageDropdown } from "./LanguageDropdown"
import { useLanguage } from "@/context/LanguageContext"
import { useCart } from "@/context/CartContext"
import { ReservationModal } from "./ReservationModal"

const navKeys: Record<string, string> = {
  "#historia": "nav.historia",
  "#menu":     "nav.menu",
  "#galeria":  "nav.galeria",
  "#resenas":  "nav.resenas",
  "#locales":  "nav.locales",
}

const Navbar = () => {
  // ── Estados de Navegación ──
  const [scrolled,   setScrolled]   = useState(false)
  const [hidden,     setHidden]     = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [activeHref, setActiveHref] = useState("")
  
  // ── Estado de Reservas ──
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  
  // ── Estados de Pedidos ──
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false)
  const [orderStep, setOrderStep] = useState<'location' | 'cart'>('location')
  const [orderLocation, setOrderLocation] = useState('')

  const { t } = useLanguage()
  const { items: cartItems, totalItems, removeItem, updateQuantity, clearCart } = useCart()

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

  // ── Handlers ──
  const closeMenu = () => setMenuOpen(false)

  const openOrderDrawer = () => {
    if (totalItems === 0) {
      const section = document.getElementById("menu")
      if (section) {
        const top = section.getBoundingClientRect().top + window.scrollY - 72
        window.scrollTo({ top, behavior: "smooth" })
      }
      return
    }
    setIsOrderDrawerOpen(true)
    setOrderStep('location')
    setOrderLocation('')
  }
  
  const closeOrderDrawer = () => {
    setIsOrderDrawerOpen(false)
    setOrderStep('location')
    setOrderLocation('')
  }

  return (
    <>
      {/* ── Header ── */}
      <header className={`navbar-header${scrolled ? " navbar-header--scrolled" : ""}${hidden ? " navbar-header--hidden" : ""}`}>
        <div className="navbar-inner flex w-full items-center justify-between">

          {/* ── IZQUIERDA: Logo ── */}
          <div className="flex flex-1 items-center justify-start">
            <a href="#hero" className="navbar-logo flex items-center gap-4" onClick={closeMenu}>
              <img src={logoGeneral} alt="Leña Quiteña" className="h-96 w-auto object-contain brightness-125" />
              <span className="navbar-logo-text hidden sm:block">{t("brand.name")}</span>
            </a>
          </div>

          {/* ── CENTRO: Nav links ── */}
          <ul className="navbar-links flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`navbar-link${activeHref === link.href ? " navbar-link--active" : ""}`}
                >
                  {t(navKeys[link.href])}
                </a>
              </li>
            ))}
          </ul>

          {/* ── DERECHA: Controles + Botón Hamburguesa ── */}
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="navbar-controls flex items-center gap-4">
              <LanguageDropdown />

              {/* Botón Pedidos + Carrito */}
              <button
                type="button"
                onClick={openOrderDrawer}
                className="navbar-cta relative flex items-center gap-2"
                aria-label="Ver carrito"
              >
                <span className="text-xs uppercase tracking-[0.2em] font-semibold leading-none">
                  Pedidos
                </span>
                <span className="w-px h-3.5 bg-white/20" />
                <span className="relative flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1"/>
                    <circle cx="19" cy="21" r="1"/>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center px-1 text-[10px] font-bold bg-[#7C0F19] text-white rounded-none">
                      {totalItems}
                    </span>
                  )}
                </span>
              </button>

              {/* Botón Reservas */}
              <button
                type="button"
                className="navbar-cta navbar-cta--reservas"
                onClick={() => setIsReservationModalOpen(true)}
              >
                {t("nav.cta.reservas")}
              </button>
            </div>

            {/* Botón hamburguesa */}
            <button
              className="navbar-hamburger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? t("nav.mobile.close") : t("nav.mobile.open")}
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
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
        </div>
      </header>

      {/* ── Backdrop móvil ── */}
      <div
        className={`mobile-backdrop${menuOpen ? " mobile-backdrop--open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ── Drawer móvil ── */}
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
                {t(navKeys[link.href])}
              </a>
            </li>
          ))}
        </ul>

        <div className="mobile-cta-group">
          <button
            type="button"
            onClick={() => { closeMenu(); openOrderDrawer() }}
            className="mobile-cta mobile-cta--pedidos"
          >
            {t("nav.cta.pedidos")}
          </button>
          <button
            type="button"
            onClick={() => { closeMenu(); setIsReservationModalOpen(true) }}
            className="mobile-cta mobile-cta--reservas"
          >
            {t("nav.cta.reservas")}
          </button>
        </div>

        <p className="mobile-tagline">{t("nav.tagline")}</p>
      </nav>

      {/* ── Drawer de Pedidos ── */}
      {isOrderDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeOrderDrawer}
            aria-hidden="true"
          />
          <aside
            className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col animate-drawer-slidein"
            style={{ boxShadow: 'rgba(0,0,0,0.15) -8px 0px 32px' }}
            tabIndex={-1}
          >
            <div className="relative flex-1 p-6 overflow-y-auto">
              <button
                onClick={closeOrderDrawer}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                aria-label="Cerrar drawer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              {orderStep === 'location' && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">¿A dónde enviamos tu pedido?</h2>
                  <input
                    type="text"
                    className="w-full rounded-lg border p-3 mb-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D1B894]"
                    placeholder="Calle y referencia"
                    value={orderLocation}
                    onChange={e => setOrderLocation(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="w-full rounded-lg bg-[#D1B894] p-3 text-white font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
                    disabled={!orderLocation.trim()}
                    onClick={() => setOrderStep('cart')}
                  >
                    Confirmar ubicación
                  </button>
                </>
              )}

              {orderStep === 'cart' && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Tu pedido</h2>
                  <div className="mb-4 text-gray-700">
                    <div className="font-semibold mb-2">Ubicación:</div>
                    <div className="mb-4 border rounded p-2 bg-gray-50">{orderLocation}</div>
                  </div>
                  {cartItems.length === 0 ? (
                    <div className="text-center text-gray-500 mb-4">
                      No has seleccionado nada.<br />Agrega platos desde el menú.
                    </div>
                  ) : (
                    <>
                      <ul className="divide-y divide-gray-200 mb-4 text-gray-800">
                        {cartItems.map((item) => (
                          <li key={item.name} className="py-3 flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.price}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.name, item.quantity - 1)}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-sm font-bold"
                              >
                                −
                              </button>
                              <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.name, item.quantity + 1)}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-sm font-bold"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item.name)}
                                className="ml-1 text-red-400 hover:text-red-600 transition"
                                aria-label={`Eliminar ${item.name}`}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-sm text-red-500 hover:text-red-700 transition mb-4"
                      >
                        Vaciar carrito
                      </button>
                    </>
                  )}
                  <button
                    className="w-full rounded-lg bg-[#D1B894] p-3 text-white font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
                    disabled={cartItems.length === 0}
                    onClick={() => {/* Lógica de confirmación */}}
                  >
                    Confirmar pedido ({totalItems})
                  </button>
                </>
              )}
            </div>
          </aside>
          <style>{`
            @keyframes drawer-slidein {
              from { transform: translateX(100%); }
              to   { transform: translateX(0); }
            }
            .animate-drawer-slidein {
              animation: drawer-slidein 0.35s cubic-bezier(.4,0,.2,1);
            }
          `}</style>
        </>
      )}

      {/* ── Modal de Reservas Extraído ── */}
      <ReservationModal 
        isOpen={isReservationModalOpen} 
        onClose={() => setIsReservationModalOpen(false)} 
      />
    </>
  )
}

export default Navbar