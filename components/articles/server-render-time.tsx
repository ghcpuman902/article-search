import { io } from 'next/cache'
import { formatDate } from '@/lib/utils'

export const ServerRenderTime = async () => {
  await io()
  return (
    <p>Server page render: {formatDate(new Date())}</p>
  )
}
