import "../App.css"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { ChatBot } from "../components/ChatBot"
import Hero from "../sections/Hero"
import Historia from "../sections/Historia"
import Menu from "../sections/Menu"
import Galeria from "../sections/Galeria"
import Resenas from "../sections/Resenas"
import Locales from "../sections/Locales"
import "./Home.css"


export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Historia />
      <Menu />
      <Galeria />
      <Resenas />
      <Locales />
      <Footer />
      <ChatBot />
    </main>
  )
}
