export const schemas = {
  createUserBody: {
    $id: 'createUserBody',
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
      name: { type: 'string', minLength: 1, maxLength: 100 },
    },
  },
  createUserResponse: {
    $id: 'createUserResponse',
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string', nullable: true },
    },
  },
  getUsersResponse: {
    $id: 'getUsersResponse',
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {
          $ref: 'user', // Reference to user schema below
        },
      },
    },
  },
  user: {
    $id: 'user',
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string', nullable: true },
    },
  },
};

export const createUserSchema = {
  body: { $ref: 'createUserBody' },
  response: {
    201: { $ref: 'createUserResponse' },
  },
};

export const getUsersSchema = {
  response: {
    200: { $ref: 'getUsersResponse' },
  },
};
