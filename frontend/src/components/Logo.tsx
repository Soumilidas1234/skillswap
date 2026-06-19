import { Link } from 'react-router-dom'
import { images } from '@/lib/images'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md'
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const iconSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  const textSize = size === 'sm' ? 'text-lg' : 'text-xl'

  return (
    <Link to="/" className={cn('flex items-center gap-2 font-display font-bold', className)}>
      <img src={images.logo} alt="SkillSwap" className={cn(iconSize, 'rounded-xl object-cover')} />
      {showText && <span className={cn('gradient-text', textSize)}>SkillSwap</span>}
    </Link>
  )
}
