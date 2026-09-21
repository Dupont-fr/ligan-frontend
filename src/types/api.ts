export interface HealthResponse {
  app: string
  status: string
  env: string
  version: string
  uptime: number
  timestamp: string
  db: {
    connected: boolean
    state: string
  }
}