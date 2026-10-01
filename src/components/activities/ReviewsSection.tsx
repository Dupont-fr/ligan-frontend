import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { MessageSquareQuote, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FormField } from '../ui/FormField'
import { StarRating } from '../ui/StarRating'
import { useAuth } from '../../features/auth/AuthContext'
import { ApiError } from '../../lib/api'
import type { BusinessRating } from '../../services/activities'
import { createReview, deleteReview, type PublicReview } from '../../services/reviews'

const schema = z.object({
  rating: z.number().int('Note requise').min(1, 'Note requise').max(5, 'Note maximum : 5'),
  comment: z
    .string()
    .trim()
    .min(10, 'Le commentaire doit contenir au moins 10 caractères')
    .max(1000, '1000 caractères maximum'),
})
type FormValues = z.infer<typeof schema>

interface ReviewsSectionProps {
  activityId: string
  rating: BusinessRating
  reviews: PublicReview[]
  isOwner: boolean
  onChanged: () => void
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ReviewsSection({ activityId, rating, reviews, isOwner, onChanged }: ReviewsSectionProps) {
  const { status, user } = useAuth()
  const [sent, setSent] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, comment: '' },
  })

  const createMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      setSent(true)
      reset()
      onChanged()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => onChanged(),
  })

  const onSubmit = async (values: FormValues) => {
    createMutation.mutate({ activityId, ...values })
  }

  const showForm = !isOwner && status === 'authenticated' && !sent
  const errorMessage =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? "Une erreur est survenue lors de l'envoi"
        : null

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <MessageSquareQuote className="h-4 w-4 text-text-muted" aria-hidden />
          Avis {rating.count > 0 ? `(${rating.count})` : ''}
        </h2>
        {rating.count > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tabular-nums text-text-primary">{rating.average}</span>
            <StarRating value={rating.average} size="sm" />
            <span className="text-xs text-text-muted">
              {rating.count} avis
            </span>
          </div>
        ) : null}
      </div>

      {/* Formulaire */}
      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-3 border-t border-border pt-4">
          <FormField label="Votre note" htmlFor="review-rating" error={errors.rating?.message}>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <StarRating
                  value={field.value}
                  onChange={field.onChange}
                  ariaLabel="Votre note"
                  id="review-rating"
                />
              )}
            />
          </FormField>
          <FormField
            label="Votre commentaire"
            htmlFor="review-comment"
            error={errors.comment?.message}
            hint="10 caractères minimum — ton avis sera publié après validation."
          >
            <textarea
              id="review-comment"
              rows={3}
              maxLength={1000}
              placeholder="Décrivez votre expérience avec ce professionnel…"
              className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-base text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
              {...control.register('comment')}
            />
          </FormField>
          {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}
          <Button type="submit" loading={isSubmitting}>
            Publier mon avis
          </Button>
        </form>
      ) : sent ? (
        <Alert variant="success" className="mt-4">
          Merci ! Ton avis a bien été envoyé et sera visible après validation par notre équipe.
        </Alert>
      ) : !isOwner && status !== 'authenticated' ? (
        <p className="mt-4 border-t border-border pt-4 text-sm text-text-secondary">
          <Link to="/login" className="font-medium text-primary transition-colors hover:text-primary-hover">
            Connectez-vous
          </Link>{' '}
          pour laisser un avis.
        </p>
      ) : null}

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <p className="mt-4 border-t border-border pt-4 text-sm text-text-muted">
          Aucun avis pour le moment. {isOwner ? '' : 'Le premier, ça peut être vous.'}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-t border-border">
          {reviews.map((review) => (
            <li key={review.id} className="py-4">
              <div className="flex flex-wrap items-center gap-2">
                <StarRating value={review.rating} size="sm" />
                <span className="text-sm font-semibold text-text-primary">
                  {review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.lastName}` : 'Client'}
                </span>
                <span className="text-xs text-text-muted">{formatDate(review.createdAt)}</span>
                {user?.id && review.reviewer?.id === user.id ? (
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(review.id)}
                    disabled={deleteMutation.isPending}
                    className="ml-auto inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-text-muted transition-colors hover:bg-error-light hover:text-error"
                    aria-label="Supprimer mon avis"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Supprimer
                  </button>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
