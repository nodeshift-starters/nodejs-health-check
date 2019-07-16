[![Build Status](https://travis-ci.org/nodeshift-starters/nodejs-health-check.svg?branch=master)](https://travis-ci.org/nodeshift-starters/nodejs-health-check) [![Coverage Status](https://coveralls.io/repos/github/nodeshift-starters/nodejs-health-check/badge.svg?branch=master)](https://coveralls.io/github/nodeshift-starters/nodejs-health-check?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/nodeshift-starters/nodejs-health-check.svg)](https://greenkeeper.io/)

Example Health Check Application

## Running The Example

You can run this example as node processes on your localhost, as pods on a local
[minishift](https://github.com/minishift/minishift/releases) installation.

### Localhost

To run the basic application on your local machine, just run the commands bellow:

```
$ npm install
$ npm start
```

If you want debug information, you can set `DEBUG` environment variable and start the application:

```
$ DEBUG=* npm start
```

This will launch the application on port 8080.

### Minishift

Minishift should be started, and you should be logged in with a currently
active project. Then run the `npm run openshift` command.

```sh
$ minishift start # You may have some options here, e.g. --memory=8096 --vm-driver=virtualbox
$ oc login -u developer # Login
$ oc new-project my-example-project # Create a project to deploy to
$ npm run openshift # Deploys the example app
```
