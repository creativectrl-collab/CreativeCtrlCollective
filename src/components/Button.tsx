import type { ButtonHTMLAttributes } from 'react'
import { controlClass, type Variant } from './control'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: Props) {
  return (
    <button type={type} className={`${controlClass(variant)} ${className}`} {...props} />
  )
}
