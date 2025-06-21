import { z } from 'zod'

export const ingestDto = z.object({
  chunks: z.array(
    z.object({
      filePath: z.string().min(1),
      content: z.string().min(1),
      language: z.string().min(1),
      startLine: z.number().min(1),
      endLine: z.number().min(1),
      nodeType: z.string().min(1),
      functionName: z.string().optional(),
      className: z.string().optional(),
      lines: z.array(z.string()).optional(),
      size: z.number().nonnegative(),
      hash: z.string().nonempty(),
    })
  ),
})
