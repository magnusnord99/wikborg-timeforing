import { useEffect, useState } from 'react'
import { styles } from './timeLogStyles'

interface Props {
  value: string
  onChange?: (value: string) => void
  onSave: (value: string) => void
  placeholder: string
  saveOnBlur?: boolean
}

export function CommentInput({ value, onChange, onSave, placeholder, saveOnBlur = false }: Props) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  function handleBlur() {
    if (saveOnBlur || local.trim() !== value.trim()) {
      onSave(local.trim())
    }
  }

  return (
    <div style={styles.commentInputWrap}>
      <input
        type="text"
        value={local}
        onChange={(event) => {
          setLocal(event.target.value)
          onChange?.(event.target.value)
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={styles.commentInput}
      />
    </div>
  )
}