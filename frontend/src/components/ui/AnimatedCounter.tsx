import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({ value, duration = 2, suffix = '', className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const spring = useSpring(0, { duration: duration * 1000 })
  const rounded = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    spring.set(value)
    const unsub = rounded.on('change', (v) => setDisplay(v))
    return unsub
  }, [value, spring, rounded])

  return (
    <motion.span className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {display.toLocaleString()}{suffix}
    </motion.span>
  )
}
