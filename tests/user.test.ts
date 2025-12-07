import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { build } from '../src/server.js'

describe('User API (Full UUID CRUD)', () => {
  let app: any

  beforeAll(async () => {
    app = await build()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    // Clear test data before each test
    await app.prisma.user.deleteMany()
  })

  describe('GET /api/users - List Users', () => {
    it('returns empty list when no users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users'
      })
      
      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({ users: [] })
    })

    it('returns list of users with valid UUIDs', async () => {
      // Create test data
      await app.prisma.user.create({
        data: {
          email: 'test1@example.com',
          name: 'Test User 1'
        }
      })
      
      await app.prisma.user.create({
        data: {
          email: 'test2@example.com',
          name: 'Test User 2'
        }
      })

      const response = await app.inject({
        method: 'GET',
        url: '/api/users'
      })
      
      expect(response.statusCode).toBe(200)
      expect(response.json().users).toHaveLength(2)
      
      // UUID validation regex (RFC 4122 v4)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      
      response.json().users.forEach((user: any) => {
        expect(user).toHaveProperty('id')
        expect(uuidRegex.test(user.id)).toBe(true) 
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('name')
        expect(user).toHaveProperty('avatar')
        expect(typeof user.active).toBe('boolean')
      })
    })
  })

  describe('POST /api/users - Create User', () => {
    it('creates user successfully with UUID', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        avatar: 'https://example.com/avatar.jpg'
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: {
          'content-type': 'application/json'
        },
        payload: userData
      })
      
      expect(response.statusCode).toBe(201)
      const user = response.json()
      
      // UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuidRegex.test(user.id)).toBe(true)
      expect(user.email).toBe('newuser@example.com')
      expect(user.name).toBe('New User')
      expect(user.active).toBe(true)
    })

    it('returns 400 for invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: {
          'content-type': 'application/json'
        },
        payload: {
          email: 'invalid-email',
          name: 'Test'
        }
      })
      
      expect(response.statusCode).toBe(400)
    })

    it('returns 409 for duplicate email', async () => {
      // Create first user
      await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { 'content-type': 'application/json' },
        payload: { email: 'duplicate@example.com', name: 'First' }
      })

      // Try duplicate
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { 'content-type': 'application/json' },
        payload: { email: 'duplicate@example.com', name: 'Second' }
      })
      
      expect(response.statusCode).toBe(409)
      expect(response.json().error).toBe('CONFLICT')
    })

    it('returns 400 for missing email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { 'content-type': 'application/json' },
        payload: { name: 'No Email' }
      })
      
      expect(response.statusCode).toBe(400)
    })
  })

  describe('GET /api/users/:id - Read Single User', () => {
    it('returns single user by UUID', async () => {
      // Create test user first
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { 'content-type': 'application/json' },
        payload: { email: 'single@example.com', name: 'Single User' }
      })
      
      const createdUser = createResponse.json()
      const userId = createdUser.id

      const response = await app.inject({
        method: 'GET',
        url: `/api/users/${userId}`
      })
      
      expect(response.statusCode).toBe(200)
      const user = response.json()
      expect(user.id).toBe(userId)
      expect(user.email).toBe('single@example.com')
    })

    it('returns 404 for non-existent UUID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/nonexistent-uuid'
      })
      
      expect(response.statusCode).toBe(404)
      expect(response.json().error).toBe('NOT_FOUND')
    })
  })

  describe('PATCH /api/users/:id - Update User', () => {
    it('updates user successfully', async () => {
      // Create test user
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { 'content-type': 'application/json' },
        payload: { email: 'update@example.com', name: 'Before Update' }
      })
      
      const userId = createResponse.json().id

      // Update user
      const updateResponse = await app.inject({
        method: 'PATCH',
        url: `/api/users/${userId}`,
        headers: { 'content-type': 'application/json' },
        payload: { 
          name: 'After Update', 
          avatar: 'https://example.com/new-avatar.jpg',
          active: false 
        }
      })
      
      expect(updateResponse.statusCode).toBe(200)
      const updatedUser = updateResponse.json()
      expect(updatedUser.name).toBe('After Update')
      expect(updatedUser.avatar).toBe('https://example.com/new-avatar.jpg')
      expect(updatedUser.active).toBe(false)
      expect(updatedUser.id).toBe(userId)
    })

    it('returns 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/users/nonexistent-uuid',
        headers: { 'content-type': 'application/json' },
        payload: { name: 'Update' }
      })
      
      expect(response.statusCode).toBe(404)
    })
  })

  describe('DELETE /api/users/:id - Delete User', () => {
    it('deletes user successfully', async () => {
      // Create test user
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { 'content-type': 'application/json' },
        payload: { email: 'delete@example.com', name: 'To Delete' }
      })
      
      const userId = createResponse.json().id

      // Delete user
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/users/${userId}`
      })
      
      expect(deleteResponse.statusCode).toBe(204)

      // Verify deleted (404)
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/users/${userId}`
      })
      expect(getResponse.statusCode).toBe(404)
    })

    it('returns 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/nonexistent-uuid'
      })
      
      expect(response.statusCode).toBe(404)
    })
  })
})
