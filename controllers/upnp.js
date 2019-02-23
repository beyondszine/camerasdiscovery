(function(){
  const {createClient} = require('nat-upnp-2');
  const client = createClient();

  function createUpnpMapping(){
    let mapObject={
      public: 12345,
      private: 54321,
      ttl: 3600
    };
    console.log(mapObject);
    client.portMapping(mapObject,function(err) {
      if(err){
        console.log('error in port mapping',err);
      }
      else{
        console.log('finished');
      }
    });
  };

  function unmapUpnp(){
    let unmapObject={
      public: 12345
    };
    client.portUnmapping(unmapObject);
  };

  function getUpnpMappings(){
    return new Promise(function(resolve,reject){
      client.getMappings(function(err, results) {
        if(err){
          console.log('error',err);
        }
        else{
          // console.log('results',results);
          resolve(results);
        }
      });
    });
  };

  function getExternalIP(){
    client.externalIp(function(err, ip) {
      if(err){
        console.log('error in external IP',err);
      }
      else{
        console.log('results external IP',ip);
      }
    });
  };

  module.exports = {
    createUpnpMapping : createUpnpMapping,
    unmapUpnp : unmapUpnp,
    getUpnpMappings : getUpnpMappings,
    getExternalIP : getExternalIP
  };

})();

