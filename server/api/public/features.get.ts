export default defineEventHandler(() => {
  return {
    features: [
      {
        id: 'roster',
        name: 'roster management',
        description: 'build, manage, and optimize crew schedules in real time.',
        available: true,
      },
      {
        id: 'dispatch',
        name: 'smart dispatch',
        description: 'intelligent scheduling based on availability, location, and priority.',
        available: true,
      },
      {
        id: 'workflows',
        name: 'workflow builder',
        description: 'create custom operational workflows without code.',
        available: true,
      },
      {
        id: 'ai-assistant',
        name: 'ai assistant',
        description: 'natural language queries for operational data.',
        available: true,
      },
      {
        id: 'replay',
        name: 'session replay',
        description: 'record and playback user sessions for training and debugging.',
        available: true,
      },
      {
        id: 'fleet-3d',
        name: '3d fleet dashboard',
        description: 'spatial visualization of fleet status and operations.',
        available: true,
      },
      {
        id: 'webhooks',
        name: 'webhooks',
        description: 'receive real-time notifications for operational events.',
        available: false,
        comingSoon: true,
      },
      {
        id: 'api',
        name: 'public api',
        description: 'programmatic access to syntraq data and operations.',
        available: false,
        comingSoon: true,
      },
    ],
  }
})
