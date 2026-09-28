import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { SiteHeader } from '../../components/layout/SiteHeader'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { slugify } from '../../lib/categories'
import { ApiError } from '../../lib/api'
import {
  createCategory,
  deleteCategory,
  listAllCategories,
  updateCategory,
  type Category,
  type CategoryInput,
} from '../../services/categories'

interface FormState {
  name: string
  slug: string
  parentId: string
  order: string
  active: boolean
}

const emptyForm: FormState = { name: '', slug: '', parentId: '', order: '', active: true }

export function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories', 'admin'],
    queryFn: listAllCategories,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['categories'] })
  }

  const saveMutation = useMutation({
    mutationFn: (input: CategoryInput) =>
      editing ? updateCategory(editing.id, input) : createCategory(input),
    onSuccess: () => {
      invalidate()
      closeForm()
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      invalidate()
      setPendingDelete(null)
      setDeleteError(null)
    },
    onError: (err) => {
      setDeleteError(err instanceof ApiError ? err.message : 'Erreur lors de la suppression')
    },
  })

  const categories = data?.categories ?? []
  const roots = categories.filter((c) => !c.parentId)
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id)

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId ?? '',
      order: String(cat.order),
      active: cat.active,
    })
    setFormError(null)
    setFormOpen(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const input: CategoryInput = {
      name: form.name.trim(),
      slug: (form.slug.trim() || slugify(form.name)).toLowerCase(),
      parentId: form.parentId || null,
      order: form.order ? Number(form.order) : undefined,
      active: form.active,
    }
    saveMutation.mutate(input)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Catégories</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Gérez les métiers proposés sur la plateforme. Une catégorie renommée reste
                synchronisée avec les activités existantes.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden />
              Nouvelle catégorie
            </Button>
          </div>

          {formOpen ? (
            <form
              onSubmit={handleSubmit}
              className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-text-primary">
                  {editing ? `Modifier « ${editing.name} »` : 'Nouvelle catégorie'}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
                  aria-label="Fermer le formulaire"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              {formError ? (
                <Alert variant="error" className="mt-3">
                  {formError}
                </Alert>
              ) : null}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cat-name" className="mb-1 block text-sm font-medium text-text-primary">
                    Nom *
                  </label>
                  <input
                    id="cat-name"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setForm((f) => ({
                        ...f,
                        name,
                        slug: editing ? f.slug : slugify(name),
                      }))
                    }}
                    required
                    minLength={2}
                    maxLength={60}
                    placeholder="Ex : Menuiserie"
                    className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="cat-slug" className="mb-1 block text-sm font-medium text-text-primary">
                    Slug *
                  </label>
                  <input
                    id="cat-slug"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    placeholder="menuiserie"
                    className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="cat-parent" className="mb-1 block text-sm font-medium text-text-primary">
                    Catégorie parente
                  </label>
                  <select
                    id="cat-parent"
                    value={form.parentId}
                    onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                    className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-sm text-text-primary outline-none focus:border-primary"
                  >
                    <option value="">— Aucune (racine) —</option>
                    {roots
                      .filter((r) => r.id !== editing?.id)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="cat-order" className="mb-1 block text-sm font-medium text-text-primary">
                    Ordre
                  </label>
                  <input
                    id="cat-order"
                    type="number"
                    min={0}
                    max={9999}
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                    placeholder="0"
                    className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
                  />
                </div>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                Catégorie visible publiquement
              </label>

              <div className="mt-4 flex gap-2">
                <Button type="submit" loading={saveMutation.isPending}>
                  {editing ? 'Enregistrer' : 'Créer'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Annuler
                </Button>
              </div>
            </form>
          ) : null}

          {deleteError ? (
            <Alert variant="error" className="mt-4">
              {deleteError}
            </Alert>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
            {isLoading ? (
              <div className="space-y-3 p-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-[var(--radius-sm)] bg-background" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-text-primary">Impossible de charger les catégories</p>
                <p className="mt-1 text-sm text-text-secondary">Réessayez plus tard.</p>
              </div>
            ) : roots.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-text-primary">Aucune catégorie</p>
                <p className="mt-1 text-sm text-text-secondary">Créez la première avec le bouton ci-dessus.</p>
              </div>
            ) : (
              <ul>
                {roots.map((root) => (
                  <li key={root.id} className="border-b border-border last:border-b-0">
                    <CategoryRow
                      category={root}
                      pending={pendingDelete === root.id}
                      deleting={deleteMutation.isPending && pendingDelete === root.id}
                      onEdit={openEdit}
                      onAskDelete={(id) => {
                        setDeleteError(null)
                        setPendingDelete(id)
                      }}
                      onCancelDelete={() => setPendingDelete(null)}
                      onConfirmDelete={(id) => deleteMutation.mutate(id)}
                    />
                    {childrenOf(root.id).length > 0 ? (
                      <ul className="border-t border-border-light bg-background/50">
                        {childrenOf(root.id).map((child) => (
                          <li key={child.id}>
                            <CategoryRow
                              category={child}
                              nested
                              pending={pendingDelete === child.id}
                              deleting={deleteMutation.isPending && pendingDelete === child.id}
                              onEdit={openEdit}
                              onAskDelete={(id) => {
                                setDeleteError(null)
                                setPendingDelete(id)
                              }}
                              onCancelDelete={() => setPendingDelete(null)}
                              onConfirmDelete={(id) => deleteMutation.mutate(id)}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

interface CategoryRowProps {
  category: Category
  nested?: boolean
  pending: boolean
  deleting: boolean
  onEdit: (cat: Category) => void
  onAskDelete: (id: string) => void
  onCancelDelete: () => void
  onConfirmDelete: (id: string) => void
}

function CategoryRow({
  category,
  nested = false,
  pending,
  deleting,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: CategoryRowProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 px-4 py-3 ${nested ? 'pl-8' : ''} transition-colors hover:bg-background/60`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{category.name}</span>
          {!category.active ? <Badge variant="warning">Inactive</Badge> : null}
        </div>
        <p className="mt-0.5 text-xs text-text-muted">
          {category.slug} · ordre {category.order}
        </p>
      </div>

      {pending ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Supprimer « {category.name} » ?</span>
          <Button
            size="sm"
            variant="danger"
            loading={deleting}
            onClick={() => onConfirmDelete(category.id)}
          >
            Confirmer
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancelDelete}>
            Non
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors hover:bg-primary-light hover:text-primary"
            aria-label={`Modifier ${category.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onAskDelete(category.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors hover:bg-error-light hover:text-error"
            aria-label={`Supprimer ${category.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}
