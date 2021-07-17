/* eslint-disable no-undef */
'use strict';

const assert = require('assert');
const supertest = require('supertest');
const app = require('../app');

describe('Test greeting route', () => {
  it('with no query param', async () => {
    const { body } = await supertest(app)
      .get('/api/greeting')
      .expect('Content-Type', /json/)
      .expect(200);

    assert.strictEqual(body.content, 'Hello, World!');
  });

  it('with a query param', async () => {
    const { body } = await supertest(app)
      .get('/api/greeting?name=Luke')
      .expect('Content-Type', /json/)
      .expect(200);

    assert.strictEqual(body.content, 'Hello, Luke');
  });

  it('after /stop route', async () => {
    let response = await supertest(app)
      .get('/api/stop')
      .expect(200);
    assert.strictEqual(response.text, 'Stopping HTTP server');

    response = await supertest(app).get('/api/greeting').expect(503);
    assert.strictEqual(response.text, 'Not online');
  });

  it('/ready is ok', async () => {
    await supertest(app)
      .get('/ready')
      .expect(200);
  });

  it('/live is ok', async () => {
    // set back to ok
    await supertest(app).get('/api/start');

    await supertest(app)
      .get('/live')
      .expect(200);
  });

  it('live is 500 after /stop route', async () => {
    let response = await supertest(app)
      .get('/api/stop')
      .expect(200);

    assert.strictEqual(response.text, 'Stopping HTTP server');

    response = await supertest(app).get('/live').expect(500);

    assert.strictEqual(response.text, 'Internal Server Error');
  });
});
