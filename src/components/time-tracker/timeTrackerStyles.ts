import type { CSSProperties } from 'react'
import { focusDetailStyles } from './focusDetailStyles'
import { focusStyles } from './focusStyles'
import { headerStyles } from './headerStyles'
import { layoutStyles } from './layoutStyles'
import { sectionStyles } from './sectionStyles'

export const styles: Record<string, CSSProperties> = {
  ...layoutStyles,
  ...headerStyles,
  ...focusStyles,
  ...focusDetailStyles,
  ...sectionStyles,
}