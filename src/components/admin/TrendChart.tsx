interface TrendSeries {
  key: string
  name: string
  /** Couleur CSS (ex. 'var(--color-primary)') — littérale, pas de classe dynamique. */
  color: string
  values: number[]
}

interface TrendChartProps {
  labels: string[]
  series: TrendSeries[]
  formatValue?: (v: number) => string
}

const STEPS = 5 // 6 lignes de grille (0 → chartMax)
const MAX_X_LABELS = 6
const CHART_HEIGHT = 176

/** Pas « rond » supérieur (1 / 2 / 2.5 / 5 × 10^n) pour un axe lisible. */
function niceStep(raw: number): number {
  if (raw <= 0) return 1
  const pow = 10 ** Math.floor(Math.log10(raw))
  const m = raw / pow
  const nice = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10
  return nice * pow
}

/** Courbes SVG légères (aucune dépendance) — grille et étiquettes en HTML
    pour un texte net sur mobile ; `preserveAspectRatio="none"` + traits
    non déformés via `vectorEffect="non-scaling-stroke"`. */
export function TrendChart({ labels, series, formatValue = (v: number) => String(v) }: TrendChartProps) {
  const max = Math.max(1, ...series.flatMap((s) => s.values))
  // Pas ≥ 1 : les séries sont des entiers (comptages, FCFA) — jamais de décimale.
  const step = Math.max(1, niceStep(max / STEPS))
  const chartMax = step * STEPS
  const gridValues = Array.from({ length: STEPS + 1 }, (_, i) => chartMax - i * step)

  const n = labels.length
  const x = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100)
  const y = (v: number) => 100 - (v / chartMax) * 100

  const xIndexes =
    n <= MAX_X_LABELS
      ? labels.map((_, i) => i)
      : Array.from({ length: MAX_X_LABELS }, (_, k) => Math.round((k * (n - 1)) / (MAX_X_LABELS - 1)))

  return (
    <div>
      {/* Légende + dernière valeur de chaque courbe */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
            {s.name}
            <span className="font-semibold tabular-nums text-text-primary">
              {formatValue(s.values[s.values.length - 1] ?? 0)}
            </span>
          </span>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        {/* Axe Y (HTML net) */}
        <div
          className="flex w-12 shrink-0 flex-col items-end justify-between text-[10px] leading-none tabular-nums text-text-muted"
          style={{ height: CHART_HEIGHT }}
          aria-hidden
        >
          {gridValues.map((v) => (
            <span key={v}>{formatValue(v)}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1" style={{ height: CHART_HEIGHT }}>
          {/* Grille horizontale */}
          <div className="absolute inset-0 flex flex-col justify-between" aria-hidden>
            {gridValues.map((v) => (
              <div key={v} className="border-t border-border" />
            ))}
          </div>

          {/* Courbes */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Courbes : ${series.map((s) => s.name).join(', ')}`}
          >
            {series.map((s) => (
              <polyline
                key={s.key}
                points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
                fill="none"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ stroke: s.color }}
              >
                <title>{s.name}</title>
              </polyline>
            ))}
          </svg>

          {/* Point terminal de chaque courbe */}
          {series.map((s) => {
            const lastIdx = s.values.length - 1
            if (lastIdx < 0) return null
            return (
              <span
                key={s.key}
                className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface"
                style={{ left: `${x(lastIdx)}%`, top: `${y(s.values[lastIdx] ?? 0)}%`, backgroundColor: s.color }}
                aria-hidden
              />
            )
          })}
        </div>
      </div>

      {/* Axe X */}
      <div className="mt-1.5 flex gap-2" aria-hidden>
        <div className="w-12 shrink-0" />
        <div className="flex min-w-0 flex-1 justify-between text-[10px] tabular-nums text-text-muted">
          {xIndexes.map((i) => (
            <span key={i}>{labels[i]}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
