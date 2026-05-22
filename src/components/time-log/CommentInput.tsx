import { styles } from './timeLogStyles'

interface Props {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  placeholder: string
}

export function CommentInput({ value, onChange, onSave, placeholder }: Props) {
  return (
    <div style={styles.commentInputWrap}>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onSave}
        placeholder={placeholder}
        style={styles.commentInput}
      />
    </div>
  )
}