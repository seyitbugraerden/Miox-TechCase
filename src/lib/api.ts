import { claimProcessPayload } from '@/data/claim-process'
import { claimProcessSchema, type ClaimProcess } from '@/types'

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration))

export async function fetchClaimProcess(): Promise<ClaimProcess> {
  await wait(850)

  return claimProcessSchema.parse(claimProcessPayload)
}
