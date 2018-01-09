'use strict';

const test = require('tape');
const supertest = require('supertest');
const proxyquire = require('proxyquire');
const app = require('../app');

test('test out greeting route with no query param', (t) => {
  supertest(app)
    .get('/api/greeting')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(response => {
      t.equal(response.body.content, 'Hello, World');
      t.end();
    });
});

test('test out greeting route with a query param', (t) => {
  supertest(app)
    .get('/api/greeting?name=Luke')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(response => {
      t.equal(response.body.content, 'Hello, Luke');
      t.end();
    });
});

test('test out greeting route after /stop route', (t) => {
  supertest(app)
    .get('/api/stop')
    .expect(200)
    .then(response => {
      t.equal(response.text, 'Stopping HTTP server', 'stop endpoint reponse text');
      return supertest(app)
        .get('/api/greeting')
        .expect(400);
    }).then(response => {
      t.end();
    });
});

test('test livenessCallback returns status OK', (t) => {
  var mockres = {
    send: function (status) {
      t.equal(status, 'OK');
      t.end();
    }
  };
  var mockProbe = function (expressApp, options) {
    options.livenessCallback(null, mockres);
  };
  const proxyApp = proxyquire('../app', {'kube-probe': mockProbe});
  supertest(proxyApp);
});
