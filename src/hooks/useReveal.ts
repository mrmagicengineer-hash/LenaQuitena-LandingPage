import { useEffect, useRef, useState } from "react"

interface UseRevealOptions {
  threshold?: number
  rootMargin?: string
  /** Una vez visible, no vuelve a ocultarse */
  once?: boolean
}

/**
 * Hook que observa un elemento con IntersectionObserver
 * y devuelve `inView` para disparar animaciones de entrada al hacer scroll.
 */
export function useReveal<T extends Element = HTMLElement>({
  threshold = 0.12,
  rootMargin = "0px 0px -40px 0px",
  once = true,
}: UseRevealOptions = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, inView }
}
