export interface Project {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  project_id: string
  start_time: string
  end_time: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface TimeEntryWithProject extends TimeEntry {
  project?: Project
}
