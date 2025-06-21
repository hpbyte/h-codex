import { z } from 'zod'

export const searchDto = z.object({
  query: z.string().min(1),
})
