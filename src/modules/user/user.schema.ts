export const schemas = {
  // Common user object
  user: {
    $id: 'user',
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string', nullable: true },
      avatar: { type: 'string', nullable: true },
      active: { type: 'boolean' },
    },
  },

  // Create user
  createUserBody: {
    $id: 'createUserBody',
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
      name: { type: 'string', minLength: 1, maxLength: 100 },
      avatar: { type: 'string', format: 'uri', nullable: true },
    },
  },
  createUserResponse: {
    $id: 'createUserResponse',
    allOf: [{ $ref: 'user' }],
  },

  // Get single user
  getUserParams: {
    $id: 'getUserParams',
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  getUserResponse: {
    $id: 'getUserResponse',
    allOf: [{ $ref: 'user' }],
  },

  // Update user
  updateUserParams: {
    $id: 'updateUserParams',
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  updateUserBody: {
    $id: 'updateUserBody',
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      avatar: { type: 'string', format: 'uri' },
      active: { type: 'boolean' },
    },
  },

  // Delete user params
  deleteUserParams: {
    $id: 'deleteUserParams',
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },

  // List users
  getUsersResponse: {
    $id: 'getUsersResponse',
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: { $ref: 'user' },
      },
    },
  },
};

export const schemasList = Object.values(schemas);

export const createUserSchema = {
  body: { $ref: 'createUserBody' },
  response: { 201: { $ref: 'createUserResponse' } },
};

export const getUsersSchema = {
  response: { 200: { $ref: 'getUsersResponse' } },
};

export const getUserSchema = {
  params: { $ref: 'getUserParams' },
  response: { 200: { $ref: 'getUserResponse' } },
};

export const updateUserSchema = {
  params: { $ref: 'updateUserParams' },
  body: { $ref: 'updateUserBody' },
  response: { 200: { $ref: 'getUserResponse' } },
};

export const deleteUserSchema = {
  params: { $ref: 'deleteUserParams' },
};
