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
      t.equal(response.body.content, 'Hello, World!');
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
      t.equal(response.text, 'Stopping HTTP server', 'stop endpoint response text');
      return supertest(app)
        .get('/api/greeting')
        .expect(503);
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
  var mockProbe = {
    init: (expressApp, options) => {
      this.options = options;
    },
    trigger: () => {
      this.options.livenessCallback(null, mockres);
    }
  };
  const proxyApp = proxyquire('../app', {'kube-probe': mockProbe.init});
  supertest(proxyApp)
    .get('/api/greeting?name=Luke')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(response => {
      mockProbe.trigger();
    });
});
test('test livenessCallback returns statusCode 500', (t) => {
  var mockres = {
    sendStatus: function (statusCode) {
      t.equal(statusCode, 500);
      t.end();
    }
  };

  var mockProbe = {
    init: (expressApp, options) => {
      this.options = options;
    },
    trigger: () => {
      this.options.livenessCallback(null, mockres);
    }
  };
  const proxyApp = proxyquire('../app', {'kube-probe': mockProbe.init});
  supertest(proxyApp)
    .get('/api/stop')
    .expect(200)
    .then(response => {
      mockProbe.trigger();
    });
});
