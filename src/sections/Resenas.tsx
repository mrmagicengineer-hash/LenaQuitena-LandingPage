interface Testimonio {
  text: string
  autor: string
  local: string
}

const TESTIMONIOS: Testimonio[] = [
  {
    text: "La comida es absolutamente deliciosa, el servicio es de primera, y el ambiente es encantador. El menú tiene ofertas fantásticas, con platos tradicionales y fusión.",
    autor: "Visitante Internacional",
    local: "Leña Quiteña San Marcos",
  },
  {
    text: "Pequeño restaurante con platos tradicionales ecuatorianos. Comida sencilla pero deliciosa, y un servicio amable. El pernil de cuy era suculento y la bondiola excelente.",
    autor: "Viajero Gastronómico",
    local: "Leña Quiteña San Marcos",
  },
  {
    text: "Tuvimos una escala larga en Quito y decidimos ir a cenar aquí. Definitivamente valió la pena. El lugar es hermoso, el mesero fue increíble y la comida absolutamente deliciosa.",
    autor: "Turista en Tránsito",
    local: "Leña Quiteña San Marcos",
  },
]

export default function Resenas() {
  return (
    <section id="testimonios" className="testimonios-section">
      <div className="section-header">
        <span className="section-label testimonios-label">Lo que dicen</span>
        <h2 className="section-title testimonios-title">
          Voces de <em>Nuestra Mesa</em>
        </h2>
        <div className="ornament-line">
          <div className="ornament-dot ornament-dot--naranja" />
        </div>
      </div>

      <div className="testimonios-grid">
        {TESTIMONIOS.map((t) => (
          <div key={t.autor} className="testimonio-card">
            <span className="quote-mark">&ldquo;</span>
            <p className="testimonio-text">{t.text}</p>
            <div className="testimonio-stars">★★★★★</div>
            <div className="testimonio-autor">{t.autor}</div>
            <div className="testimonio-local">{t.local}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
