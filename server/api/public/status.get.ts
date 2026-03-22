export default defineEventHandler(() => {
  return {
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }
})
