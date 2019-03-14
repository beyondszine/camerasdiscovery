(function(){
    'use strict';
    
    // starting with only one Queue as of now then will make this under Manager itself to CRUD on Queues.
    // TODO: to have interface for 'Jobs' & 'Queues' objects both.


    const queueName='VideoSaveJobs';
    const jobsCategory='VideoJobRunner';
    const redisURI = 'redis://127.0.0.1:6379';

    const Queue = require('bull');
    const videoSaveJobsQueue = new Queue(queueName, redisURI);

    function addJob(jobdata,mQueue=videoSaveJobsQueue){
        console.log('adding job for: ', jobdata);
        var myjob=mQueue.add(jobsCategory, jobdata); // myjob is a promise to make a job enter in queue.
        return myjob
        .then(function(mjob){ // mjob is now the job itself.
          console.log(`jobs's id is ${mjob.id} and `);
          return mjob;    
        })
        .catch(err => {
            throw new Error(err);
        })

    }

    function getJobs(mQueue=videoSaveJobsQueue){
        return mQueue.getJobs();
    }

    module.exports = {
        addJob : addJob,
        getJobs : getJobs
      };
    
})();