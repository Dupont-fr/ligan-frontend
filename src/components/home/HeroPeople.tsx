type HeroPeopleProps = {
  className?: string
}

/**
 * Pub illustrée du hero — trois professionnels (mécanicien, coiffeuse,
 * pro avec téléphone) devant un halo de marque. Illustration plate,
 * couleurs pilotées par les tokens (--color-*) pour suivre les 3 thèmes.
 */
export function HeroPeople({ className }: HeroPeopleProps) {
  return (
    <svg
      viewBox="0 0 720 260"
      preserveAspectRatio="xMidYMax meet"
      className={className}
      aria-hidden
      focusable="false"
    >
      {/* Halo de fond */}
      <circle cx="360" cy="250" r="190" fill="var(--color-primary-light)" opacity="0.75" />
      <circle cx="525" cy="244" r="120" fill="var(--color-secondary)" opacity="0.06" />
      <circle cx="205" cy="240" r="98" fill="var(--color-primary)" opacity="0.1" />

      {/* Ombres au sol */}
      <ellipse cx="170" cy="251" rx="36" ry="5" fill="var(--color-text-muted)" opacity="0.3" />
      <ellipse cx="360" cy="251" rx="36" ry="5" fill="var(--color-text-muted)" opacity="0.3" />
      <ellipse cx="552" cy="251" rx="36" ry="5" fill="var(--color-text-muted)" opacity="0.3" />

      {/* Bulle de discussion */}
      <g opacity="0.9">
        <rect x="398" y="42" width="46" height="32" rx="11" fill="var(--color-info)" />
        <path d="M412 72 L410 84 L424 72 Z" fill="var(--color-info)" />
        <circle cx="412" cy="58" r="3.5" fill="var(--color-surface)" />
        <circle cx="422" cy="58" r="3.5" fill="var(--color-surface)" />
        <circle cx="432" cy="58" r="3.5" fill="var(--color-surface)" />
      </g>

      {/* Épingle de localisation */}
      <g transform="translate(666 48)">
        <path
          d="M18 0 C8 0 0 8 0 18 C0 31 18 48 18 48 C18 48 36 31 36 18 C36 8 28 0 18 0 Z"
          fill="var(--color-secondary)"
        />
        <circle cx="18" cy="17" r="7" fill="var(--color-surface)" />
      </g>

      {/* Points décoratifs */}
      <circle cx="432" cy="150" r="7" fill="var(--color-primary)" />
      <circle cx="662" cy="168" r="6" fill="var(--color-info)" opacity="0.7" />
      <circle cx="700" cy="96" r="5" fill="var(--color-secondary)" opacity="0.8" />
      <circle cx="478" cy="66" r="5" fill="var(--color-warning)" />
      <g transform="translate(638 122)">
        <path
          d="M12 0 L14.8 8.2 L23.4 8.6 L16.6 14.1 L19.2 22.4 L12 17.2 L4.8 22.4 L7.4 14.1 L0.6 8.6 L9.2 8.2 Z"
          fill="var(--color-warning)"
        />
      </g>

      {/* ===== Mécanicien ===== */}
      <g>
        {/* Jambes */}
        <rect x="157" y="196" width="13" height="50" rx="6.5" fill="var(--color-info)" />
        <rect x="177" y="196" width="13" height="50" rx="6.5" fill="var(--color-info)" />
        {/* Chaussures */}
        <rect x="151" y="240" width="21" height="11" rx="5.5" fill="#3f3f45" />
        <rect x="175" y="240" width="21" height="11" rx="5.5" fill="#3f3f45" />
        {/* Bras gauche (le long du corps) */}
        <path d="M155 158 L146 196" stroke="var(--color-primary)" strokeWidth="13" strokeLinecap="round" />
        <circle cx="145" cy="200" r="6.5" fill="#c68642" />
        {/* Torse — polo orange */}
        <rect x="149" y="146" width="43" height="56" rx="16" fill="var(--color-primary)" />
        {/* Bras droit levé avec clé plate */}
        <path
          d="M187 157 L205 171 L201 146"
          stroke="var(--color-primary)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="201" cy="143" r="6.5" fill="#c68642" />
        <g transform="rotate(18 201 122)">
          <rect x="196.5" y="98" width="9" height="42" rx="4.5" fill="var(--color-text-secondary)" />
          <circle cx="201" cy="99" r="8" fill="none" stroke="var(--color-text-secondary)" strokeWidth="6" />
        </g>
        {/* Cou + tête */}
        <rect x="166" y="134" width="9" height="14" fill="#c68642" />
        <circle cx="170" cy="124" r="17" fill="#c68642" />
        {/* Cheveux */}
        <path d="M153 121 A17 17 0 0 1 187 121 Z" fill="#5a3a22" />
      </g>

      {/* ===== Coiffeuse ===== */}
      <g>
        {/* Afro */}
        <circle cx="360" cy="131" r="26" fill="#3a2417" />
        {/* Jambes */}
        <rect x="347" y="228" width="11" height="22" rx="5.5" fill="#8d5524" />
        <rect x="363" y="228" width="11" height="22" rx="5.5" fill="#8d5524" />
        {/* Chaussures */}
        <rect x="341" y="242" width="20" height="11" rx="5.5" fill="#3f3f45" />
        <rect x="361" y="242" width="20" height="11" rx="5.5" fill="#3f3f45" />
        {/* Robe */}
        <rect x="337" y="166" width="47" height="56" rx="15" fill="var(--color-secondary)" />
        <path d="M339 214 L382 214 L391 244 L330 244 Z" fill="var(--color-secondary)" />
        {/* Bras gauche */}
        <path d="M343 180 L334 214" stroke="var(--color-secondary)" strokeWidth="12" strokeLinecap="round" />
        <circle cx="333" cy="218" r="6" fill="#8d5524" />
        {/* Bras droit levé avec ciseaux */}
        <path
          d="M379 180 L391 204 L384 188"
          stroke="var(--color-secondary)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="383" cy="185" r="6" fill="#8d5524" />
        <g stroke="var(--color-text-secondary)" strokeWidth="3" strokeLinecap="round">
          <path d="M377 166 L387 182" />
          <path d="M387 166 L377 182" />
          <circle cx="375" cy="163" r="4" fill="none" />
          <circle cx="389" cy="163" r="4" fill="none" />
        </g>
        {/* Cou + visage */}
        <rect x="356" y="148" width="9" height="12" fill="#8d5524" />
        <circle cx="360" cy="137" r="17" fill="#8d5524" />
      </g>

      {/* ===== Pro avec téléphone ===== */}
      <g>
        {/* Jambes — pantalon kaki */}
        <rect x="538" y="196" width="14" height="50" rx="7" fill="var(--color-warning)" />
        <rect x="558" y="196" width="14" height="50" rx="7" fill="var(--color-warning)" />
        {/* Chaussures */}
        <rect x="532" y="240" width="22" height="11" rx="5.5" fill="#3f3f45" />
        <rect x="557" y="240" width="22" height="11" rx="5.5" fill="#3f3f45" />
        {/* Bras gauche */}
        <path d="M535 157 L527 196" stroke="var(--color-success)" strokeWidth="13" strokeLinecap="round" />
        <circle cx="526" cy="200" r="6.5" fill="#f1c27d" />
        {/* Torse — polo vert */}
        <rect x="529" y="144" width="47" height="58" rx="16" fill="var(--color-success)" />
        {/* Bras droit tenant le téléphone */}
        <path
          d="M571 157 L585 173 L566 181"
          stroke="var(--color-success)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="563" cy="182" r="6.5" fill="#f1c27d" />
        {/* Téléphone */}
        <rect x="546" y="161" width="18" height="29" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
        <rect x="550" y="167" width="10" height="4" rx="2" fill="var(--color-primary)" />
        <rect x="550" y="174" width="7" height="4" rx="2" fill="var(--color-primary)" opacity="0.55" />
        {/* Cou + tête */}
        <rect x="548" y="132" width="9" height="14" fill="#f1c27d" />
        <circle cx="552" cy="122" r="17" fill="#f1c27d" />
        {/* Cheveux courts */}
        <path d="M535 119 A17 17 0 0 1 569 119 Z" fill="#241a12" />
      </g>
    </svg>
  )
}
