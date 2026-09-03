"use client"

import * as React from "react"
import { BentoBox } from "./BentoBox"
import { CardTitle, CardDescription } from "./Card"
import { Progress } from "./Progress"

interface HealthMetric {
  id: string
  label: string
  value: number
  unit: string
  status: 'optimal' | 'warning' | 'critical'
  type: 'biometric' | 'nutritional'
}

interface HealthBentoGridProps {
  metrics: HealthMetric[]
}

/**
 * HealthBentoGrid - Asymmetric layout for high-density health data.
 * Prioritizes Silo 01 (Fitness) and Silo 03 (Mind) metrics.
 */
export function HealthBentoGrid({ metrics }: HealthBentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 auto-rows-[180px]">
      {/* PRIMARY METRIC (Fitness PRs) */}
      <BentoBox span="col-2" className="row-span-2 bg-gradient-to-br from-brand-neon/20 to-transparent">
        <CardTitle className="text-4xl text-brand-neon">Workout Capacity</CardTitle>
        <CardDescription>Estimated metabolic ceiling based on last session</CardDescription>
        <div className="mt-8">
           <Progress value={78} className="h-6" />
           <p className="mt-2 text-right font-mono text-xl">78% Efficiency</p>
        </div>
      </BentoBox>

      {/* FEEDBACK LOOP (Silo 02: Clinical Nutrition) */}
      <BentoBox span="col-1" className="bg-brand-sage/10">
        <CardTitle className="text-xl">Glycemic Index</CardTitle>
        <div className="mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold">92</span>
            <span className="text-xs opacity-50 mb-1">mg/dL</span>
        </div>
      </BentoBox>

      {/* RECOVERY STATUS (Silo 03: Mind & Habits) */}
      <BentoBox span="col-1" className="bg-white/5">
         <CardTitle className="text-xl">Fatigue Index</CardTitle>
         <div className="mt-4">
             <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-signal-success w-[15%]" />
             </div>
             <p className="mt-2 text-xs uppercase tracking-widest text-signal-success">Optimal Recovery</p>
         </div>
      </BentoBox>

      {/* DYNAMIC SLOT (A2UI Injector Area) */}
      <BentoBox span="col-2" className="border-dashed border-brand-neon/30 bg-transparent flex items-center justify-center">
         <p className="text-sm opacity-40 italic">Awaiting Agent Intentions...</p>
      </BentoBox>
    </div>
  )
}
