// frontend/src/utils/format.js

const formatDate = (date) => {
  console.log('formatDate called with date:', date);
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default formatDate
