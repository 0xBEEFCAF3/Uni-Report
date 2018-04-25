const mongoose = require('mongoose');
var schema = mongoose.Schema;


var userSchema = new schema({
	id: Number,
	name: String,
	email: String,
	lastLog: String
});



mongoose.model('user', userSchema);

function userExists(id){
	/**
	*@param: (Int) User id from google
	*@return: (Bool) True if exists
	**/

	let user  = mongoose.model('user');
	return new Promise(function(resolve, reject) {
	  	user.findOne({id:id},function (err, userObject) {
			  if (err) return reject(err);
			  //console.log(userObject);
			  if(userObject == null || userObject == {}){
			  	resolve({});
			  }else{
			  	resolve(userObject);
			  }
		});
	});
}


function createUser(id, name, email){
	let user  = mongoose.model('user');
	let newUser = new user({
        id: id,
		name: name,
		email: email,
		lastLog: new Date()
      });
      newUser.save(function (err) {
        if (err) return console.error(err);
      });
}


module.exports = {userExists : userExists, createUser: createUser};