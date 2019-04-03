(function(){
    'use strict';
    
    // starting with only one Queue as of now then will make this under Manager itself to CRUD on Queues.
    // TODO: to have interface for 'Jobs' & 'Queues' objects both.


    const saveQueueName='VideoSaveJobs';
    const streamQueueName='VideoStreamJobs';
    const jobsCategory='VideoJobRunner';
    const redisURI = 'redis://127.0.0.1:6379';

    const Queue = require('bull');
    const videoSaveJobsQueue = new Queue(saveQueueName, redisURI);
    const videoStreamJobsQueue = new Queue(streamQueueName, redisURI);


    function addJob(jobdata,mQueue=videoSaveJobsQueue){
        console.log('adding job for: ', jobdata);
        if(jobdata.type=="local" && jobdata.videostreamOptions.restream==true){
            mQueue = videoStreamJobsQueue;
            console.log("adding job to:",mQueue);
        }

        var myjob=mQueue.add(jobsCategory, jobdata); // myjob is a promise to make a job enter in queue.
        return myjob
        .then(function(mjob){ // mjob is now the job itself.
          console.log(`jobs's id is ${mjob.id}`);
          return mjob;    
        })
        .catch(err => {
            throw new Error(err);
        });

    }

    function deleteJob(jobid,mQueue=videoSaveJobsQueue){
        console.log(`trying to delete job with id ${jobid}`);
        return mQueue.getJob(jobid)
        .then(mjob => {
            console.log("obtained job for deletion:",mjob);
            return mjob.remove();
        })
        .catch(err => {
            console.error("Error happened at Deleting job",err);
            throw new Error(err);
        });
    }

    function getJobs(mQueue=videoSaveJobsQueue){
        var respobj={
            'countsData' : null,
            'jobs':null
        };

        return mQueue.getJobCounts()
        .then(countsData => {
            respobj.countsData = countsData;
            return mQueue.getJobs();
        })
        .then(jobsData => {
            respobj.jobs = jobsData;
            console.log("Response object is",respobj);
            return respobj;
        })
        .catch(err => {
            throw new Error("Eror happend in getting all jobs & status",err);
        });
    }

    function getJob(jobid,mQueue=videoSaveJobsQueue){
        return mQueue.getJob(jobid);
    }

    module.exports = {
        addJob : addJob,
        getJobs : getJobs,
        getJob : getJob,
        deleteJob : deleteJob
      };
    
})();