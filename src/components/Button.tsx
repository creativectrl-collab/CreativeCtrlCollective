import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'partner'

const variants: Record<Variant, string> = {
  primary:
    'bg-signal text-void hover:bg-paper focus-visible:outline-signal',
  ghost:
    'border border-line bg-transparent text-paper hover:border-signal hover:text-signal focus-visible:outline-signal',
  partner:
    'border border-line bg-raised text-paper hover:border-paper focus-visible:outline-paper',
}

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
    <button
      type={type}
      className={`inline-flex w-full min-w-0 items-center justify-center px-5 py-3 font-display text-sm font-medium tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
