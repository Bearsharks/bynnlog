'use client'

import { usePathname } from 'next/navigation'
import Link from '@/components/Link'
import { ComponentProps } from 'react'

interface ActiveLinkProps extends ComponentProps<typeof Link> {
  activeClassName?: string
}

export function ActiveLink({ href, className, activeClassName, ...props }: ActiveLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={`${className} ${isActive ? activeClassName : ''} hover:text-primary-500 dark:hover:text-primary-500`}
      {...props}
    />
  )
}
