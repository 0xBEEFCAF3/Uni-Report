const mongoose = require('mongoose');
var schema = mongoose.Schema;


var cacheSchema = new schema({
	endpoint: String,
	args: Object,
	response: Object,
	lastUsed: String
});


mongoose.model('cache', cacheSchema)

 function checkCache(endpoint, args){
  	/**
	* @param: endpoint being reached (String)
	* @param: arguments provided (Object)
	* @return: response object (Object)
  	**/
  	let cacheResponse = null;
  	let cache  = mongoose.model('cache');
  	return new Promise(function(resolve, reject) {
	  	cache.findOne({endpoint:endpoint, args:args},function (err, cacheObject) {
			  if (err) return reject(err);
			  //console.log(cacheObject);
			  if(cacheObject == null || cacheObject == {}){
			  	resolve({});
			  }else{
			  resolve(cacheObject.response);
			  }
		});
	});
	
}


module.exports = {checkCache : checkCache};
