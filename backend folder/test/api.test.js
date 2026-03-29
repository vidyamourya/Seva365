const request = require('supertest');
const { app, db } = require('../server');

describe('Integration Testing - Seva365', () => {

  test('Login test', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: "test@gmail.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(400); // based on your backend
  });

  test('Signup user', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        name: "Vidya",
        email: "vidya" + Date.now() + "@gmail.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
  });

  test('Book service', async () => {
    const res = await request(app)
      .post('/book')
      .send({
        name: "Vidya",
        email: "vidya@gmail.com",
        phone: "1234567890",
        service: "Cleaning",
        sub_service: "Home Cleaning",
        booking_date: "2026-03-20",
        message: "Test booking"
      });

    expect(res.statusCode).toBe(200);
  });

});
afterAll(() => {
  db.end();
});