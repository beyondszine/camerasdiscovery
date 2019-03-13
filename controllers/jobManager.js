(function(){
    'use strict';
    
    // starting with only one Queue as of now then will make this under Manager itself to CRUD on Queues.
    // TODO: to have interface for 'Jobs' & 'Queues' objects both.

    const Queue = require('bull');
    const videoSaveJobsQueue = new Queue('VideoSaveJobs', 'redis://127.0.0.1:6379');

    function addVideoSaveJob(jobdata){
        console.log('adding job for: ', jobdata);
        var myjob=videoSaveJobsQueue.add('VideoJobRunner', jobdata); // myjob is a promise to make a job enter in queue.

        return myjob
        .then(function(mjob){ // mjob is now the job itself.
          console.log(`jobs's id is ${mjob.id} and `);
            return mjob;    
        })
        .catch(err => {
          console.log("some error:: ",err);
        });
    }

        //   return mjob.getState();
        // .then(mjobstate => {
        //   console.log("myjob's state is",mjobstate);
        // })


    module.exports = {
        addVideoSaveJob : addVideoSaveJob
      };
    
})();