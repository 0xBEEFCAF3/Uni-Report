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
			  checkAndEvict(endpoint);	
			  resolve(cacheObject.response);
			  }
		});
	});
	
}

  function checkAndEvict(endpoint){
  	/**
	* @param: Endpoint of intrest (String)
	* @return : (void)
	* @details: If cache value is older than 5 days, we evict
  	**/
  		let cacheResponse = null;
  		let cache  = mongoose.model('cache');


  		getAllEntries().then(function(response){
  			for(let key in response){
  				let timeStamp = new Date(response[key]["lastUsed"] );
  				let curr = new Date();
  				curr.setDate(curr.getDate() - 5);//5 days from now
  				if(curr !== timeStamp){
  					//eviction condition
  					deleteEntry(response[key]["args"]).then(function(){
  					});
  				}

  			}
  		});

  		function deleteEntry(entry){
  			/**
  			*@param: (object)
  			**/ 
  			return new Promise(function(resolve, reject) {
		  		cache.findOne({args:entry},function (err, cacheObject) {
				  if (err) return reject(err);
				  //console.log(cacheObject);
				  if(cacheObject == null || cacheObject == {}){
				  	resolve({});
				  }else{
				  	resolve(cacheObject.response);
				  }
				});
			});
  		}//end of delte



  		function getAllEntries(){
	  		return new Promise(function(resolve, reject) {
		  		cache.findOne({endpoint:endpoint},function (err, cacheObject) {
				  if (err) return reject(err);
				  //console.log(cacheObject);
				  if(cacheObject == null || cacheObject == {}){
				  	resolve({});
				  }else{
				  resolve(cacheObject.response);
				  }
			});
		});
	  }//end of getAll

  }


module.exports = {checkCache : checkCache};
