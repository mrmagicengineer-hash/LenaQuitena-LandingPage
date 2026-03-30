interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Historia",      href: "#historia"      },
  { label: "Menú",          href: "#menu"           },
  { label: "Galería",       href: "#galeria"        },
  { label: "Reseñas",       href: "#resenas"        },
  { label: "Locales",       href: "#locales"        },
];

export default NAV_LINKS;
