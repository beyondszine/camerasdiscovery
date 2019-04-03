const Arena = require('bull-arena');
const express = require('express');
const arenaRouter = express.Router();
const config = require('config');

const arenaConfig = config.get('arenaOptions');

const arena = Arena({queues: arenaConfig.arenaQueueConfig.queues},arenaConfig.arenaServerConfig);

arenaRouter.use('/', arena);

module.exports = arenaRouter;
