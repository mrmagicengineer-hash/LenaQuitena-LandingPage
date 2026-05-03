import { useState, useEffect } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { useRestaurant, type RestaurantKey } from "@/context/RestaurantContext"
import { MapPin, Clock, Phone, CarFront } from "lucide-react"

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const MAP_SAN_MARCOS = "https://www.google.com/maps?q=Juan+P%C3%ADo+Mont%C3%BAfar+N4-14+Quito&output=embed"
const MAP_LA_RONDA = "https://www.google.com/maps?q=Calle+Guayaquil+S1-76+Quito&output=embed"

type LocalKey = "san-marcos" | "la-ronda"

interface LocalData {
  key: LocalKey
  tabLabel: string
  title: string
  zoneLabel: string
  address: string[]
  hours: string[]
  phone?: string
  parking?: string 
  mapSrc: string
  mapTitle: string
  facebook: string
  instagram: string
}

const LOCALES: LocalData[] = [
  {
    key: "san-marcos",
    tabLabel: "San Marcos",
    title: "San Marcos",
    zoneLabel: "Zona San Marcos",
    address: ["Juan Pío Montúfar N4-14, Barrio San Marcos", "Centro Histórico, Quito"],
    hours: ["Lunes – Sábado: 12:00 – 21:00", "Domingo: 12:00 – 19:00"],
    phone: "+593 98 757 9515",
    parking: "Contamos con parqueadero privado para clientes.",
    mapSrc: MAP_SAN_MARCOS,
    mapTitle: "Ubicación Leña Quiteña San Marcos",
    facebook: "https://www.facebook.com/p/Le%C3%B1a-Quite%C3%B1a-San-Marcos-61561033751397/",
    instagram: "https://www.instagram.com/lenaquitena_sanmarcos/",
  },
  {
    key: "la-ronda",
    tabLabel: "La Ronda",
    title: "La Ronda",
    zoneLabel: "Zona La Ronda",
    address: ["Calle Guayaquil S1-76, La Ronda", "Centro Histórico, Quito 170130"],
    hours: ["Lunes – Jueves: 13:30 – 22:00", "Viernes – Sábado: 13:30 – 00:00", "Domingo: 13:30 – 22:00"],
    parking: "Parqueadero cercano en la Ronda / Zona de parqueo disponible.", 
    mapSrc: MAP_LA_RONDA,
    mapTitle: "Ubicación Leña Quiteña La Ronda",
    facebook: "https://www.facebook.com/lenaquitenalaronda/",
    instagram: "https://www.instagram.com/lena_quitena/",
  },
]

export default function Locales() {
  const { t } = useLanguage()
  const { selectedRestaurant } = useRestaurant()

  const [activeLocalKey, setActiveLocalKey] = useState<LocalKey>("san-marcos")

  useEffect(() => {
    if (selectedRestaurant) setActiveLocalKey(selectedRestaurant)
  }, [selectedRestaurant])

  const localizedLocales: LocalData[] = LOCALES.map((local) => {
    if (local.key === "san-marcos") {
      return {
        ...local,
        tabLabel: t("locales.tab.san_marcos"),
        title: "San Marcos",
        zoneLabel: t("locales.san_marcos.zone"),
        address: [t("locales.san_marcos.address1"), t("locales.san_marcos.address2")],
        hours: [t("locales.san_marcos.hours1"), t("locales.san_marcos.hours2")],
        phone: t("locales.san_marcos.phone"),
        parking: local.parking, 
      }
    }

    return {
      ...local,
      tabLabel: t("locales.tab.la_ronda"),
      title: "La Ronda",
      zoneLabel: t("locales.la_ronda.zone"),
      address: [t("locales.la_ronda.address1"), t("locales.la_ronda.address2")],
      hours: [t("locales.la_ronda.hours1"), t("locales.la_ronda.hours2"), t("locales.la_ronda.hours3")],
      parking: local.parking,
    }
  })

  const activeLocal = localizedLocales.find((local) => local.key === activeLocalKey) ?? localizedLocales[0]

  const parseHourLine = (line: string) => {
    const [dayPart, ...timeParts] = line.split(":")
    return {
      day: dayPart.trim(),
      time: timeParts.join(":").trim(),
    }
  }

  return (
    <section
      id="locales"
      className="locales-section"
    >
      <div className="section-header">
        <span className="section-label locales-label">{t("locales.section.label")}</span>
        <h2 className="section-title locales-title">
          {t("locales.section.title")}
        </h2>
        <div className="ornament-line">
          <div className="ornament-dot ornament-dot--naranja" />
        </div>
      </div>

      <div className="locales-body locales-map-layout">
        <div className="locales-tabs map-selectors">
          <h3>{t("locales.selector.title")}</h3>
          {localizedLocales.map((local) => (
            <button
              key={local.key}
              type="button"
              className={`map-selector-btn${local.key === activeLocal.key ? " map-selector-btn--active" : ""}`}
              onClick={() => setActiveLocalKey(local.key)}
            >
              {local.tabLabel}
            </button>
          ))}
        </div>

        <article className="local-card local-card--on-map flex flex-col gap-6">
          <h4 className="text-3xl md:text-4xl">{activeLocal.title}</h4>

          <div className="local-info-block">
            <span className="local-label text-sm md:text-[0.95rem] tracking-wider mb-2 block">
              <MapPin size={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: "0.4rem" }} />
              {t("locales.label.address")}
            </span>
            <p className="text-[1.05rem] md:text-[1.15rem] leading-relaxed text-[#F5EDD8]/90 font-cormorant">
              {activeLocal.address.map((line, idx) => (
                <span key={`${activeLocal.key}-address-${idx}`}>
                  {line}
                  {idx < activeLocal.address.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>

          <div className="local-info-block">
            <span className="local-label text-sm md:text-[0.95rem] tracking-wider mb-2 block">
              <Clock size={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: "0.4rem" }} />
              {t("locales.label.hours")}
            </span>
            <table className="horarios-table w-full text-[1.05rem] md:text-[1.15rem] text-[#F5EDD8]/90 font-cormorant" aria-label={`Horarios ${activeLocal.tabLabel}`}>
              <tbody>
                {activeLocal.hours.map((line, idx) => {
                  const parsed = parseHourLine(line)
                  return (
                    <tr key={`${activeLocal.key}-hours-${idx}`}>
                      <th scope="row" className="text-left font-normal py-1 pr-4">{parsed.day}</th>
                      <td className="text-right py-1">{parsed.time}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="local-info-block">
            <span className="local-label text-sm md:text-[0.95rem] tracking-wider mb-1 block">
              <Phone size={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: "0.4rem" }} />
              {t("locales.label.contact")}
            </span>
            <p className="phone text-[1.05rem] md:text-[1.15rem] text-[#F5EDD8]/90 font-cormorant m-0">
              {activeLocal.phone ?? t("locales.contact.unavailable")}
            </p>
          </div>

          {/* ── SECCIÓN DE PARQUEADERO ── */}
          {activeLocal.parking && (
            <div className="local-info-block">
              <span className="local-label text-sm md:text-[0.95rem] tracking-wider mb-1 block">
                <CarFront size={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: "0.4rem" }} />
                Parqueadero
              </span>
              <p className="text-[1.05rem] md:text-[1.15rem] leading-relaxed text-[#F5EDD8]/90 font-cormorant m-0">
                {activeLocal.parking}
              </p>
            </div>
          )}

          {/* ── REDES SOCIALES ── */}
          <div className="flex gap-8 mt-2">
            <a
              href={activeLocal.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start bg-transparent p-0 border-none cursor-pointer group outline-none"
            >
              <span className="mb-1 text-[#F5EDD8]/60 group-hover:text-[#D1B894] transition-colors duration-300">
                <FacebookIcon />
              </span>
              <span className="font-cinzel text-[0.95rem] md:text-[1.05rem] tracking-[0.15em] text-[#F5EDD8] group-hover:text-white transition-colors duration-300">
                FACEBOOK
              </span>
            </a>

            <a
              href={activeLocal.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start bg-transparent p-0 border-none cursor-pointer group outline-none"
            >
              <span className="mb-1 text-[#F5EDD8]/60 group-hover:text-[#D1B894] transition-colors duration-300">
                <InstagramIcon />
              </span>
              <span className="font-cinzel text-[0.95rem] md:text-[1.05rem] tracking-[0.15em] text-[#F5EDD8] group-hover:text-white transition-colors duration-300">
                INSTAGRAM
              </span>
            </a>
          </div>
        </article>

        <div className="map-container">
          <div className="mapa-zone-badge">{activeLocal.zoneLabel}</div>
          <iframe
            title={activeLocal.mapTitle}
            src={activeLocal.mapSrc}
            width="600"
            height="450"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  )
}