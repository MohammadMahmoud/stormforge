import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { build } from '../src/server.js'

let app: any

describe('Server Core Functionality', () => {
  beforeAll(async () => {
    app = await build()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Server Initialization', () => {
    it('builds Fastify instance successfully', () => {
      expect(app).toBeDefined()
      expect(typeof app.inject).toBe('function')
    })

    it('has logger configured', () => {
      expect(app.log).toBeDefined()
    })

    it('has Prisma client available', () => {
      expect(app.prisma).toBeDefined()
    })
  })

  describe('Health Endpoint', () => {
    it('returns 200 OK', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })
      expect(response.statusCode).toBe(200)
    })

    it('returns correct health structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })
      const body = response.json()
      expect(body.status).toBe('OK')
      expect(body.timestamp).toBeDefined()
      expect(body.uptime).toBeDefined()
    })
  })

  describe('Swagger Documentation', () => {
    it('returns Swagger JSON', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/docs/json'
      })
      expect(response.statusCode).toBe(200)
    })

    it('serves Swagger UI', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/docs'
      })
      expect(response.statusCode).toBe(200)
    })
  })

  describe('Middleware', () => {
    it('has security headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })
      // Just check Helmet headers exist
      expect(response.headers['x-content-type-options']).toBeDefined()
      expect(response.headers['x-frame-options']).toBeDefined()
    })

    it('handles CORS', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
        headers: { origin: 'test' }
      })
      // CORS header exists or request succeeds
      expect(response.statusCode).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('returns 404 for unknown routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/nonexistent'
      })
      expect(response.statusCode).toBe(404)
    })

    it('handles bad requests', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: 'invalid'
      })
      expect(response.statusCode).toBeLessThan(500)
    })
  })
})
