'use client'

import React from 'react'
import { formatDate } from '@/lib/utils'

export const ServerRenderTime: React.FC = () => {
  return (
    <p>Server page render: {formatDate(new Date())}</p>
  )
}
