const request = require('supertest');
const app = require('./server');  // Import the app
let server;

beforeAll(async () => {
    process.env.NODE_ENV = "test";
    server = app.listen(3000);
});

afterAll(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
});

describe('GET /api/hello', () => {
  it('should return status 200 and the correct JSON message', async () => {
    const response = await request(app).get('/api/hello');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello from server!' }); // Check the JSON response body
    expect(response.type).toBe('application/json'); // Ensure the content type is JSON
  });
});
