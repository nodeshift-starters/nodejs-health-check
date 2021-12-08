'use strict';

/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

let isOnline = true;

//
app.use('/api/greeting', (request, response) => {
  if (!isOnline) {
    response.status(503);
    return response.send('Not online');
  }

  const name = request.query ? request.query.name : undefined;
  return response.send({ content: `Hello, ${name || 'World!'}` });
});

app.use('/api/stop', (request, response) => {
  isOnline = false;
  return response.send('Stopping HTTP server');
});

// Only for testing locally.  A deployment on Openshift will handle this8
app.use('/api/start', (request, response) => {
  isOnline = true;
  return response.send('Starting HTTP server');
});

// Readiness Probe
app.use('/ready', (request, response) => {
  return response.sendStatus(200);
});

// Liveness Probe
app.use('/live', (request, response) => {
  return isOnline ? response.send('OK') : response.sendStatus(500);
});

module.exports = app;
