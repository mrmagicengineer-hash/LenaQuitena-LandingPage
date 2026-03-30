interface MenuItem {
  name: string
  desc: string
}

interface MenuCategory {
  icon: string
  title: string
  items: MenuItem[]
}

const CATEGORIES: MenuCategory[] = [
  {
    icon: "🍖",
    title: "De la Leña",
    items: [
      { name: "Cuy al Horno", desc: "Cocción lenta en horno de leña" },
      { name: "Tomahawk a la Brasa", desc: "Corte premium ahumado" },
      { name: "Pernil de Cerdo", desc: "Marinado 24 horas" },
      { name: "Bondiola al Carbón", desc: "Cerdo glaseado, guarnición criolla" },
    ],
  },
  {
    icon: "🍲",
    title: "Tradición Quiteña",
    items: [
      { name: "Seco de Chivo", desc: "Receta de la abuela" },
      { name: "Sopa de Bolas", desc: "Verde rellena, caldo claro" },
      { name: "Llapingachos", desc: "Con chorizo y huevo" },
      { name: "Fritada Serrana", desc: "Mote, choclo y tostado" },
    ],
  },
  {
    icon: "🍮",
    title: "Postres & Bebidas",
    items: [
      { name: "Tiramisú de Pistacho", desc: "Fusión premiada" },
      { name: "Colada Morada", desc: "Receta ancestral" },
      { name: "Chicha de Jora", desc: "Fermentación artesanal" },
      { name: "Rosero Quiteño", desc: "Bebida de las fiestas" },
    ],
  },
]

export default function Menu() {
  return (
    <section id="menu" className="menu-section">
      {/* Header */}
      <div className="section-header">
        <span className="section-label menu-label">Nuestra Carta</span>
        <h2 className="section-title menu-title">
          Sabores que <em>Perduran</em>
        </h2>
        <div className="ornament-line">
          <div className="ornament-dot ornament-dot--naranja" />
        </div>
      </div>

      {/* Grid de categorías */}
      <div className="menu-grid">
        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="menu-category">
            <span className="menu-category-icon">{cat.icon}</span>
            <h4>{cat.title}</h4>
            {cat.items.map((item) => (
              <div key={item.name} className="menu-item">
                <div>
                  <span className="menu-item-name">{item.name}</span>
                  <span className="menu-item-desc">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="menu-note">
        ✦ Menú sujeto a disponibilidad de temporada · Consulta por grupos y
        eventos especiales ✦
      </p>
    </section>
  )
}
