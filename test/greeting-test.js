/* eslint-disable no-undef */
'use strict';

const assert = require('assert');
const supertest = require('supertest');
const proxyquire = require('proxyquire');
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

  it('after /stop route', () => {
    supertest(app)
      .get('/api/stop')
      .expect(200)
      .then(response => {
        assert.strictEqual(response.text, 'Stopping HTTP server');
        return supertest(app)
          .get('/api/greeting')
          .expect(503);
      }).then(response => {
        assert.strictEqual(response.text, 'Not online');
      });
  });

  it('livenessCallback returns status OK', () => {
    const mockres = {
      send: status => {
        t.equal(status, 'OK');
        t.end();
      }
    };
    const mockProbe = {
      init: (expressApp, options) => {
        this.options = options;
      },
      trigger: () => {
        this.options.livenessCallback(null, mockres);
      }
    };
    const proxyApp = proxyquire('../app', { 'kube-probe': mockProbe.init });
    supertest(proxyApp)
      .get('/api/greeting?name=Luke')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        mockProbe.trigger();
      });
  });

  it('livenessCallback returns statusCode 500', () => {
    const mockres = {
      sendStatus: statusCode => {
        t.equal(statusCode, 500);
        t.end();
      }
    };

    const mockProbe = {
      init: (expressApp, options) => {
        this.options = options;
      },
      trigger: () => {
        this.options.livenessCallback(null, mockres);
      }
    };
    const proxyApp = proxyquire('../app', { 'kube-probe': mockProbe.init });
    supertest(proxyApp)
      .get('/api/stop')
      .expect(200)
      .then(() => {
        mockProbe.trigger();
      });
  });
});
