interface Props { title: string; isDeleting: boolean; onCancel: () => void; onConfirm: () => void }

export default function DeletePropertyDialog({ title, isDeleting, onCancel, onConfirm }: Props) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
      <h2 id="delete-title" className="text-xl font-semibold text-slate-900">Delete property?</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">“{title}” will be permanently removed. This action cannot be undone.</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel} disabled={isDeleting}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? 'Deleting…' : 'Delete property'}</button>
      </div>
    </div>
  </div>
}
