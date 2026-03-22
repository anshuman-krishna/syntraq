export interface TutorialStep {
  id: string
  target: string
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export interface Tutorial {
  id: string
  name: string
  steps: TutorialStep[]
}
