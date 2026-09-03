import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "./Button"

interface BentoBoxProps extends HTMLMotionProps<"div"> {
  span?: 'col-1' | 'col-2' | 'col-3' | 'row-1' | 'row-2'
}

/**
 * BentoBox - Modular housing for biometric and nutritional blocks.
 * Implements spring physics for layout transitions.
 */
const BentoBox = React.forwardRef<HTMLDivElement, BentoBoxProps>(
  ({ className, span = 'col-1', ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl p-6",
          {
            "col-span-1": span === 'col-1',
            "col-span-2": span === 'col-2',
            "col-span-3": span === 'col-3',
            "row-span-1": span === 'row-1',
            "row-span-2": span === 'row-2',
          },
          className
        )}
        {...props}
      />
    )
  }
)
BentoBox.displayName = "BentoBox"

export { BentoBox }
