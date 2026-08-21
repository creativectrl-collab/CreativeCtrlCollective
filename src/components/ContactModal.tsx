import { ContactForm } from './ContactForm'

export function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-void/85 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-lg border border-line bg-surface p-6 rounded shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-line pb-3 mb-6">
          <h2 className="font-display text-lg font-bold text-paper uppercase tracking-wider">Contact & Subscribe</h2>
          <button 
            type="button" 
            onClick={onClose}
            className="text-mute hover:text-signal font-mono text-xs"
          >
            ✕ CLOSE
          </button>
        </div>

        <ContactForm />
      </div>
    </div>
  )
}
