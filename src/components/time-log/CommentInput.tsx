import { useEffect, useState } from 'react'
import { styles } from './timeLogStyles'

interface Props {
  value: string
  onSave: (value: string) => void
  placeholder: string
}

export function CommentInput({ value, onSave, placeholder }: Props) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  function handleBlur() {
    if (local.trim() !== value.trim()) {
      onSave(local.trim())
    }
  }

  return (
    <div style={styles.commentInputWrap}>
      <input
        type="text"
        value={local}
        onChange={(event) => setLocal(event.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={styles.commentInput}
      />
    </div>
  )
}