import type { CSSProperties } from 'react'

export const sectionStyles: Record<string, CSSProperties> = {
  section: {
    background: 'var(--color-panel)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-soft)',
    borderRadius: 20,
    padding: 22,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },
  sectionDescription: {
    margin: '6px 0 0',
    color: 'rgba(148, 163, 184, 0.88)',
    fontSize: 14,
    lineHeight: 1.5,
  },
  sectionMeta: {
    padding: '8px 10px',
    borderRadius: 999,
    background: 'var(--color-accent-soft)',
    color: 'var(--color-text)',
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  dateControls: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  dateToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  dateInput: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    fontSize: 14,
  },
  dateHelper: {
    color: 'rgba(148, 163, 184, 0.86)',
    fontSize: 14,
  },
  loadingText: {
    margin: 0,
    color: 'var(--color-text-muted)',
  },
}