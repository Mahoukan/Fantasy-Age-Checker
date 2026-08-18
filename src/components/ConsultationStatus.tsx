import type { Quip } from '../types/quip'

interface ConsultationStatusProps {
  message: Quip
}

export function ConsultationStatus({ message }: ConsultationStatusProps) {
  return (
    <section className="consultation-status" role="status" aria-live="polite" aria-atomic="true">
      <div className="consultation-orbit" aria-hidden="true">
        <span>ARB</span>
      </div>
      <div>
        <p className="eyebrow dark">Review in progress</p>
        <h2>Consulting the Oracle...</h2>
        <p className="consultation-message">{message.text}</p>
      </div>
    </section>
  )
}
