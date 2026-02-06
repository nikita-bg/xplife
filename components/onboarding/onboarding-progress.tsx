interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={`step-${i}`}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === currentStep
              ? 'w-8 bg-primary'
              : i < currentStep
              ? 'w-2 bg-primary/60'
              : 'w-2 bg-muted'
          }`}
        />
      ))}
    </div>
  )
}
