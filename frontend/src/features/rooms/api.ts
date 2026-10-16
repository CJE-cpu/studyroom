import axios from 'axios'
import { z } from 'zod'
import type { Room } from './types'

const roomsSchema = z.array(
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    capacity: z.number().int().positive(),
    image: z.string(),
    description: z.string(),
    amenities: z.array(z.string()),
  }),
)

export async function getRooms(): Promise<Room[]> {
  const response = await axios.get<unknown>('/api/rooms', {
    timeout: 10000,
  })
  return roomsSchema.parse(response.data)
}
