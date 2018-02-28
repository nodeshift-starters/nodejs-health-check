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

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

const probe = require('kube-probe');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// expose the license.html at http[s]://[host]:[port]/licences/licenses.html
app.use('/licenses', express.static(path.join(__dirname, 'licenses')));

let isOnline = true;

//
app.use('/api/greeting', (request, response) => {
  if (!isOnline) {
    return response.sendStatus(503);
  }

  const name = request.query ? request.query.name : undefined;
  return response.send({content: `Hello, ${name || 'World!'}`});
});

app.use('/api/stop', (request, response) => {
  isOnline = false;
  return response.send('Stopping HTTP server');
});

const options = {
  livenessCallback: (request, response) => {
    return isOnline ? response.send('OK') : response.sendStatus(500);
  }
};

probe(app, options);

module.exports = app;
