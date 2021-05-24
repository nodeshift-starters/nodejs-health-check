/* eslint-disable no-undef */
'use strict';

const assert = require('assert');
const util = require('util');
const supertest = require('supertest');
const rhoaster = require('rhoaster');

const setTimeoutPromise = util.promisify(setTimeout);

const packagejson = require('../../package.json');

const testEnvironment = rhoaster({
  deploymentName: packagejson.name,
  dockerImage: 'registry.access.redhat.com/ubi8/nodejs-12'
});

describe('Greeting route', () => {
  let route;
  before(async function () {
    this.timeout(0);
    route = await testEnvironment.deploy();
  });

  it('/api/greeting', async () => {
    const { body } = await supertest(route)
      .get('/api/greeting')
      .expect('Content-Type', /json/)
      .expect(200);

    assert.strictEqual(body.content, 'Hello, World!');
  });

  it('/api/greeting with query param', async () => {
    const { body } = await supertest(route)
      .get('/api/greeting?name=luke')
      .expect('Content-Type', /json/)
      .expect(200);

    assert.strictEqual(body.content, 'Hello, luke');
  });

  it('/api/health/readiness returns OK', async function () {
    this.timeout(81000);
    // Wait the initial 60 seconds before the liveness probe kicks in.
    await setTimeoutPromise(60000);
    let response = await supertest(route)
      .get('/api/health/readiness')
      .expect(200)
      .expect('Content-Type', 'text/html')
    assert.strictEqual(response.text, 'OK');
    // Now shut the endpoint down
    response = await supertest(route).get('/api/stop').expect(200);
    assert.strictEqual(response.text, 'Stopping HTTP server');
    // Check that the greeting is down
    response = await supertest(route).get('/api/greeting').expect(503);
    assert.strictEqual(response.statusCode, 503);
    // Now ping the liveness probe which should return a 50x response
    response = await supertest(route).get('/api/health/liveness').expect(500);
    assert.strictEqual(response.statusCode, 500);
    // Wait until the app is back up
    await setTimeoutPromise(20000);
    // After we wait check the app again
    response = await supertest(route)
      .get('/api/greeting')
      .expect(200)
      .expect('Content-Type', /json/);
    assert.strictEqual(response.body.content, 'Hello, World!');
  });

  after(async function () {
    this.timeout(0);
    await testEnvironment.undeploy();
  });
});
