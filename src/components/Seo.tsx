import { useLocation } from 'react-router-dom'
import { usePageMeta } from '../lib/usePageMeta'

const DEFAULT_TITLE = 'LIGAN+ — Trouvez les professionnels près de vous'
const DEFAULT_DESCRIPTION =
  'LIGAN+ : trouvez les professionnels près de vous. Mécaniciens, plombiers, coiffeurs, artisans et plus.'

const META: Record<string, { title: string; description: string }> = {
  '/': { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  '/trouver': {
    title: 'Trouver un professionnel près de chez vous — LIGAN+',
    description:
      'Recherchez un plombier, mécanicien, coiffeur ou artisan près de chez vous : résultats géolocalisés, avis et disponibilités.',
  },
  '/categories': {
    title: 'Catégories de professionnels — LIGAN+',
    description: 'Parcourez toutes les catégories de professionnels disponibles sur LIGAN+.',
  },
  '/tarifs': {
    title: 'Tarifs et plans — LIGAN+',
    description: 'Découvrez les plans LIGAN+ pour les professionnels : gratuit, PRO et PREMIUM.',
  },
  '/a-propos': {
    title: 'À propos — LIGAN+',
    description: 'La mission de LIGAN+ : connecter particuliers et professionnels locaux, près de chez vous.',
  },
  '/aide': {
    title: "Centre d'aide — LIGAN+",
    description: 'Comptes, recherche, plans et paiements : les réponses aux questions fréquentes.',
  },
  '/contact': {
    title: 'Contact — LIGAN+',
    description: 'Une question ou un problème ? Écrivez à l’équipe LIGAN+.',
  },
  '/conditions': {
    title: "Conditions générales d'utilisation — LIGAN+",
    description: "Conditions d'utilisation du service LIGAN+.",
  },
  '/confidentialite': {
    title: 'Politique de confidentialité — LIGAN+',
    description: 'Comment LIGAN+ collecte et protège vos données personnelles.',
  },
  '/login': {
    title: 'Connexion — LIGAN+',
    description: 'Connectez-vous à votre compte LIGAN+.',
  },
  '/register': {
    title: 'Créer un compte — LIGAN+',
    description: 'Créez votre compte LIGAN+ pour contacter des professionnels ou publier vos services.',
  },
  '/forgot-password': {
    title: 'Mot de passe oublié — LIGAN+',
    description: 'Réinitialisez le mot de passe de votre compte LIGAN+.',
  },
  '/reset-password': {
    title: 'Nouveau mot de passe — LIGAN+',
    description: 'Choisissez un nouveau mot de passe pour votre compte LIGAN+.',
  },
  '/verify-email': {
    title: 'Vérification de l’e-mail — LIGAN+',
    description: 'Vérifiez votre adresse e-mail pour activer votre compte LIGAN+.',
  },
  '/deconnexion': {
    title: 'Déconnexion — LIGAN+',
    description: 'Confirmez la déconnexion de votre compte LIGAN+.',
  },
  '/dashboard': {
    title: 'Mon espace — LIGAN+',
    description: 'Gérez vos activités, services, sollicitations et abonnement.',
  },
}

/**
 * Titre + description par route (SPA : le HTML est unique, donc mis à jour à
 * chaque navigation). Les routes non listées et l'espace admin tombent sur le
 * titre par défaut ; la fiche `/business/:slug` se gère elle-même (données).
 */
export function Seo() {
  const { pathname } = useLocation()
  const meta =
    META[pathname] ??
    (pathname.startsWith('/admin')
      ? { title: 'Administration — LIGAN+', description: 'Console d’administration de la plateforme LIGAN+.' }
      : null)
  usePageMeta(meta?.title ?? DEFAULT_TITLE, meta?.description ?? DEFAULT_DESCRIPTION)
  return null
}
