interface GaleriaItem {
  icon: string
  text: string
  span?: number
  tall?: boolean
}

const ITEMS: GaleriaItem[] = [
  { icon: "🔥", text: "Ambiente del restaurante\nFoto principal", tall: true },
  { icon: "🍖", text: "Cuy al horno de leña" },
  { icon: "🏛️", text: "Local La Ronda" },
  { icon: "🪵", text: "Horno de leña artesanal", span: 2 },
  { icon: "🥩", text: "Tomahawk a la brasa" },
  { icon: "🏘️", text: "Local San Marcos" },
]

export default function Galeria() {
  return (
    <section id="galeria" className="galeria-section">
      {/* Header */}
      <div className="section-header">
        <span className="section-label">Galería</span>
        <h2 className="section-title">
          Momentos que <em>Saben</em>
        </h2>
        <div className="ornament-line">
          <div className="ornament-dot" />
        </div>
      </div>

      {/* Grid */}
      <div className="galeria-grid">
        {ITEMS.map((item) => (
          <div
            key={item.text}
            className="galeria-item"
            style={item.span ? { gridColumn: `span ${item.span}` } : undefined}
          >
            <div
              className="galeria-placeholder"
              style={item.tall ? { minHeight: 420 } : undefined}
            >
              <span className="galeria-placeholder-icon">{item.icon}</span>
              <span className="galeria-placeholder-text">
                {item.text.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < item.text.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </span>
            </div>
            <div className="galeria-overlay" />
          </div>
        ))}
      </div>

    </section>
  )
}
