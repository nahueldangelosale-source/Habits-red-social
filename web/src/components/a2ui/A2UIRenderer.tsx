
"use client"

import * as React from "react"
import { BentoBox } from "../ui/BentoBox"
import { CardTitle, CardDescription } from "../ui/Card"
import { Button, cn } from "../ui/Button"
import { useCognitiveLoad } from "../../hooks/useCognitiveLoad"

interface A2UIIntent {
  type: string
  props: any
}

/**
 * REGISTRY: Map of Intent types to React Components
 */
const COMPONENT_REGISTRY: Record<string, React.FC<any>> = {
  DietaryCorrectionCard: ({ deltaCarbs, reason }: { deltaCarbs: string, reason: string }) => (
    <div className="space-y-4">
      <CardTitle className="text-brand-sage">Nutrition Pivot</CardTitle>
      <CardDescription>{reason}</CardDescription>
      <div className="text-3xl font-bold">{deltaCarbs}</div>
      <Button variant="secondary" size="sm" className="w-full">Accept Adjustment</Button>
    </div>
  ),
  OvertrainingAlert: ({ message }: { message: string }) => (
    <div className="space-y-4 p-4 bg-signal-error/20 rounded-xl border border-signal-error/50">
      <CardTitle className="text-signal-error">Safety Trigger</CardTitle>
      <p className="text-sm font-medium">{message}</p>
      <Button variant="destructive" size="sm" className="w-full">Stop Session Now</Button>
    </div>
  ),
  EffortReward: ({ tokens }: { tokens: number }) => (
    <div className="text-center space-y-2">
       <span className="text-4xl">💎</span>
       <div className="text-2xl font-bold">+{tokens} Tokens</div>
       <CardDescription>Gamification Reward</CardDescription>
    </div>
  )
}

/**
 * A2UIRenderer - Switchboard for Agent Intentions.
 * Dynamically hydrates components based on JSON payloads.
 * Respects Cognitive Load (Quiet Mode).
 */
export function A2UIRenderer({ intent }: { intent: A2UIIntent | null }) {
  const { calmMode } = useCognitiveLoad()

  if (!intent) return null

  // SILO 03 OVERRIDE: Hide non-essential/gamification components in Calm Mode
  if (calmMode && intent.type === "EffortReward") {
    console.warn("[A2UI] Component Omitted due to high cognitive load (Fatigue detected)")
    return null
  }

  const Component = COMPONENT_REGISTRY[intent.type]

  if (!Component) {
    return (
      <div className="p-4 border border-dashed rounded-xl opacity-50">
        Unknown Intent: {intent.type}
      </div>
    )
  }

  return (
    <BentoBox 
      layoutId={intent.type}
      className={cn(
        "bg-white/5 border-brand-neon/20 shadow-lg shadow-brand-neon/5",
        calmMode && "grayscale brightness-75 transition-all duration-1000"
      )}
    >
      <Component {...intent.props} />
    </BentoBox>
  )
}
