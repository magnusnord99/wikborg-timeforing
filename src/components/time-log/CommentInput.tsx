import { useEffect, useState } from 'react'
import { styles } from './timeLogStyles'

interface Props {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  placeholder: string
}

export function CommentInput({ value, onChange, onSave, placeholder }: Props) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  function handleBlur() {
    onSave()
  }

  function handleChange(nextValue: string) {
    setLocal(nextValue)
    onChange(nextValue)
  }

  return (
    <div style={styles.commentInputWrap}>
      <input
        type="text"
        value={local}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={styles.commentInput}
      />
    </div>
  )
}