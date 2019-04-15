var express = require('express');
const os = require('os');
var router = express.Router();
const jobManager = require('../controllers/jobManager');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const rDebug = require('debug')('routes');

router.use(function(req,res,next){
    rDebug(`${req.method}    ${req.url}`);
    next();
});

/* GET home page. */
router.route('/Queues')
    .get(function(req,res){
        throw new Error('Not Yet Implemented');
    })
    .post(function(req,res){
        throw new Error('Not Yet Implemented');
    })
    .put(function(req,res){
        throw new Error('Not Yet Implemented');
    })
    .delete(function(req,res){
        throw new Error('Not Yet Implemented');
    });

router.route('/Jobs')
    .get(function(req,res){
        jobManager.getJobs()
        .then(jobsResponse => {
            // rDebug("list of jobs :",JSON.stringify(jobsResponse));
            return res.send(jobsResponse);
        })
        .catch(err => {
            console.error("Error occured while getting jobs",err);
            throw new Error(err);
        });
    })
    .post(jsonParser,function(req,res){
        console.log('posted Job with ',JSON.stringify(req.body));
        jobManager.addJob(req.body)
        .then(mjob => {
            // rDebug(`added job is: ${mjob}`);
            return res.send({"_message":"job addded successfully!","_status":"OK","_data":mjob});
        })
        .catch(err => {
            throw new Error(err);
        });
    });

router.route('/Jobs/:id')
    .get(function(req,res){
        jobManager.getJob(req.params.id)
        .then(jobdata => {
            return res.send(jobdata);
        })
        .catch(err => {
            throw new Error(err);
        });
    })
    .delete(function(req,res){
        jobManager.deleteJob(req.params.id)
        .then(status => {
            console.log("deletion status is",status);
            return res.send({"_status":"SUCCESS"});
        })
        .catch(err => {
            throw new Error(err);
        });
    });

module.exports = router;
