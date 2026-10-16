import axios from 'axios'
import type { Room } from './types'

export async function getRooms(): Promise<Room[]> {
  const response = await axios.get<Room[]>('/api/rooms', {
    timeout: 10000,
  })
  return response.data
}