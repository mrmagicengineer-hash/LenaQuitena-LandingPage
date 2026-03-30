import NAV_LINKS from "../assets/constants/Navlinks"
import Button from "./Button"

interface MobileMenuProps {
  isOpen:     boolean
  activeHref: string
  onClose:    () => void
}

const MobileMenu = ({ isOpen, activeHref, onClose }: MobileMenuProps) => {
  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={[
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* ── Drawer panel ── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={[
          "fixed top-0 right-0 z-50 h-full w-72",
          "flex flex-col pt-24 pb-10 px-8",
          "mobile-menu-panel lg:hidden",
          "transition-transform duration-400 ease-[cubic-bezier(0.76,0,0.24,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] mobile-menu-accent-bar" />

        {/* Nav links */}
        <ul className="flex flex-col gap-1 flex-1" role="list">
          {NAV_LINKS.map(({ label, href }, i) => (
            <li
              key={href}
              style={{ transitionDelay: isOpen ? `${i * 55}ms` : "0ms" }}
              className={[
                "transition-all duration-300",
                isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5",
              ].join(" ")}
            >
              <a
                href={href}
                onClick={onClose}
                className={[
                  "mobile-nav-link",
                  activeHref === href ? "mobile-nav-link--active" : "",
                ].join(" ")}
              >
                {/* Diamond bullet */}
                <span
                  className={[
                    "mobile-nav-bullet",
                    activeHref === href ? "mobile-nav-bullet--active" : "",
                  ].join(" ")}
                />
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          href="#reservaciones"
          onClick={onClose}
          variant="primary"
          className="w-full text-center mt-4"
        >
          Hacer Reserva
        </Button>

        {/* Tagline */}
        <p className="mobile-menu-tagline">
          El Sabor de la Memoria
        </p>
      </div>
    </>
  )
}

export default MobileMenu