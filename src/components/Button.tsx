import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react"

/* ── Types ── */
type Variant = "primary" | "outline" | "ghost"

interface BaseProps {
  children:  ReactNode
  variant?:  Variant
  className?: string
}

/* When used as <a> */
interface AsAnchorProps extends BaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> {
  href: string
}

/* When used as <button> */
interface AsButtonProps extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  href?: never
}

type ButtonProps = AsAnchorProps | AsButtonProps

/* ── Variant class map ── */
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "btn-primary",
  outline: "btn-outline",
  ghost:   "btn-ghost",
}

/* ── Component ── */
const Button = ({ children, variant = "primary", className = "", ...rest }: ButtonProps) => {
  const classes = [VARIANT_CLASSES[variant], className].filter(Boolean).join(" ")

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest as AsAnchorProps
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    )
  }

  const buttonRest = rest as AsButtonProps
  return (
    <button className={classes} {...buttonRest}>
      {children}
    </button>
  )
}

export default Button