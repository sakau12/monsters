'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { somnia } from './somnia-chains'

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_PROJECT_NAME ?? 'monster',
  projectId:
    process.env.NEXT_PUBLIC_PROJECT_ID ?? '2daa8849dcc648315b6371d404b75f0c',
  chains:
    process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [somnia] : [somnia],
  ssr: true,
})
