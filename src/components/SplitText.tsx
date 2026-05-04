import { useRef } from "react"
import { motion, useInView } from "motion/react"

interface SplitTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
  delay?: number
  stagger?: number
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
}

export default function SplitText({
  text,
  className = "",
  style,
  delay = 0,
  stagger = 0.06,
  as: Tag = "h2",
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-12%" })

  const words = text.split(" ")

  return (
    <Tag
      // @ts-expect-error ref mismatch between union element types
      ref={ref}
      className={`overflow-hidden ${className}`}
      style={style}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }}
            transition={{
              duration: 0.75,
              delay: delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
