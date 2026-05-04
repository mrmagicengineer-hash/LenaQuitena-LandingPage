import { useRef } from "react"
import { motion, useInView } from "motion/react"

interface ImageRevealProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  delay?: number
  onClick?: () => void
}

export default function ImageReveal({ src, alt, className = "", style, delay = 0, onClick }: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10%" })

  return (
    <div ref={ref} className="relative overflow-hidden w-full h-full" style={style} onClick={onClick}>
      {/* Curtain que se levanta revelando la imagen */}
      <motion.div
        className="absolute inset-0 z-10 origin-bottom"
        style={{ backgroundColor: "#1F0C09" }}
        initial={{ scaleY: 1 }}
        animate={inView ? { scaleY: 0 } : { scaleY: 1 }}
        transition={{ duration: 1, delay, ease: [0.76, 0, 0.24, 1] }}
      />
      {/* Imagen — empieza zoom y normaliza */}
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        initial={{ scale: 1.12 }}
        animate={inView ? { scale: 1 } : { scale: 1.12 }}
        transition={{ duration: 1.4, delay: delay + 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
        loading="lazy"
      />
    </div>
  )
}
