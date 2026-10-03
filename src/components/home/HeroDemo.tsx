import { CheckCircle2, MapPin, Search, ShieldCheck, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

const SCENES = [
  { id: 'search', duration: 3400 },
  { id: 'results', duration: 3200 },
  { id: 'profile', duration: 3200 },
  { id: 'sent', duration: 3400 },
] as const

const pros = [
  { initials: 'JB', name: 'Jean B.', job: 'Plombier • Douala', note: '4,8', dist: '1,2 km', delay: '0.1s' },
  { initials: 'MK', name: 'Marie K.', job: 'Coiffeuse • Bonabéri', note: '4,9', dist: '0,8 km', delay: '0.35s' },
]

function SceneSearch() {
  return (
    <div>
      <p className="text-[11px] font-semibold text-text-primary">Que recherchez-vous ?</p>
      <div className="mt-2 flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3">
        <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
        <span className="demo-typing text-xs text-text-primary">plombier</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['Plombier', 'Coiffeur', 'Mécanicien'].map((chip, i) => (
          <span
            key={chip}
            className="demo-rise rounded-[var(--radius-full)] border border-border bg-surface px-2 py-1 text-[10px] text-text-secondary"
            style={{ animationDelay: `${0.7 + i * 0.15}s` }}
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="demo-click mt-3 rounded-[var(--radius-sm)] bg-primary py-2 text-center text-[11px] font-semibold text-primary-contrast">
        Rechercher
      </div>
    </div>
  )
}

function SceneResults() {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] font-semibold text-text-primary">
        <MapPin className="h-3 w-3 text-primary" aria-hidden />
        12 pros près de vous
      </p>
      <div className="mt-2 space-y-2">
        {pros.map((pro) => (
          <div
            key={pro.name}
            className="demo-rise flex items-center gap-2.5 rounded-[var(--radius-md)] border border-border bg-surface p-2.5"
            style={{ animationDelay: pro.delay }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-[10px] font-bold text-primary">
              {pro.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[11px] font-semibold text-text-primary">
                {pro.name}
                <ShieldCheck className="h-3 w-3 shrink-0 text-success" aria-hidden />
              </p>
              <p className="truncate text-[10px] text-text-muted">{pro.job}</p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-0.5 text-[10px] font-semibold text-text-primary">
                <Star className="h-3 w-3 fill-warning text-warning" aria-hidden />
                {pro.note}
              </p>
              <p className="text-[9px] text-text-muted">{pro.dist}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="demo-rise mt-3 flex items-center justify-between rounded-[var(--radius-md)] border border-dashed border-border px-2.5 py-2" style={{ animationDelay: '0.65s' }}>
        <span className="text-[10px] text-text-muted">Voir les 10 autres →</span>
        <span className="text-[10px] font-semibold text-primary">Tri : proximité</span>
      </div>
    </div>
  )
}

function SceneProfile() {
  return (
    <div>
      <div className="demo-rise flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-[11px] font-bold text-primary">
          JB
        </span>
        <div>
          <p className="text-[11px] font-semibold text-text-primary">Jean B.</p>
          <p className="text-[10px] text-success">Pro vérifié • Douala</p>
        </div>
      </div>
      <div
        className="demo-rise mt-3 rounded-[var(--radius-md)] border border-border bg-surface p-3"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold text-text-primary">Réparation de fuite d’eau</p>
            <p className="mt-0.5 text-[10px] text-text-muted">Plomberie • À domicile</p>
          </div>
          <p className="text-[11px] font-bold text-primary">5 000 F</p>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[10px] text-text-secondary">
          <Star className="h-3 w-3 fill-warning text-warning" aria-hidden />
          4,8 <span className="text-text-muted">(24 avis)</span>
        </div>
      </div>
      <div className="demo-click mt-3 rounded-[var(--radius-sm)] bg-primary py-2 text-center text-[11px] font-semibold text-primary-contrast">
        Contacter
      </div>
      <p className="mt-2 text-center text-[9px] text-text-muted">Réponse directe, sans intermédiaire</p>
    </div>
  )
}

function SceneSent() {
  return (
    <div>
      <p className="text-[11px] font-semibold text-text-primary">Jean B. — Plombier</p>
      <div className="demo-rise mt-2 flex justify-end" style={{ animationDelay: '0.15s' }}>
        <p className="max-w-[85%] rounded-[var(--radius-md)] rounded-br-sm bg-primary-light px-2.5 py-2 text-[10px] leading-snug text-text-primary">
          Bonjour, une fuite sous mon évier à Bonabéri, disponible demain ?
        </p>
      </div>
      <div
        className="demo-rise mt-4 rounded-[var(--radius-md)] border border-success/30 bg-success-light p-3 text-center"
        style={{ animationDelay: '0.9s' }}
      >
        <CheckCircle2
          className="demo-pop mx-auto h-7 w-7 text-success"
          style={{ animationDelay: '1.15s' }}
          aria-hidden
        />
        <p className="mt-1.5 text-[11px] font-semibold text-text-primary">Demande envoyée</p>
        <p className="mt-0.5 text-[10px] text-text-secondary">Le pro vous répond directement</p>
      </div>
      <div className="demo-rise mt-3 rounded-[var(--radius-md)] border border-border bg-surface px-2.5 py-2" style={{ animationDelay: '1.5s' }}>
        <p className="text-[10px] text-text-muted">Statut</p>
        <p className="text-[10px] font-semibold text-success">Envoyée • en attente de réponse</p>
      </div>
    </div>
  )
}

export function HeroDemo() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (reducedMotion) return
    const timer = setTimeout(
      () => setSceneIndex((current) => (current + 1) % SCENES.length),
      SCENES[sceneIndex].duration,
    )
    return () => clearTimeout(timer)
  }, [sceneIndex, reducedMotion])

  const scenes = [
    <SceneSearch key="search" />,
    <SceneResults key="results" />,
    <SceneProfile key="profile" />,
    <SceneSent key="sent" />,
  ]

  return (
    <div
      role="img"
      aria-label="Démonstration animée : recherche d’un plombier, résultats classés par proximité, fiche professionnelle, message envoyé."
      className="relative mx-auto w-full max-w-[290px]"
    >
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-primary/10 blur-2xl" aria-hidden />
      <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[var(--shadow-lg)]">
        <div className="flex justify-center pt-2" aria-hidden>
          <span className="h-1.5 w-16 rounded-full bg-border" />
        </div>

        <div className="mt-1.5 flex items-center justify-between border-b border-border px-3 pb-2">
          <span className="text-[11px] font-black italic uppercase tracking-tight text-text-primary">
            LIGAN<span className="text-[1.5em] font-black italic leading-none text-brand-red">+</span>
          </span>
          <span className="rounded-[var(--radius-full)] bg-primary-light px-1.5 py-0.5 text-[8px] font-semibold text-primary">
            DÉMO
          </span>
        </div>

        <div className="flex h-[380px] flex-col bg-background">
          <div className="flex flex-1 flex-col justify-center overflow-hidden px-3 py-3">{scenes[sceneIndex]}</div>
          <div className="flex gap-1.5 px-3 pb-3" aria-hidden>
            {SCENES.map((scene, i) => (
              <span
                key={scene.id}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i === sceneIndex ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
