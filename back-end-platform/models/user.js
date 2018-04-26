const mongoose = require('mongoose');
var schema = mongoose.Schema;


var userSchema = new schema({
	id: Number,
	name: String,
	email: String,
	lastLog: String,
	likedUnis: [String]
});

mongoose.model('user', userSchema);

function getUserLikes(id){
	/**
	*@param: (Int) User id from google
	*@return: [String] Array of schools the user liked
	**/
	let user  = mongoose.model('user');
	return new Promise(function(resolve, reject) {
	  	user.findOne({id:id},function (err, userObject) {
			  if (err) return reject(err);
			  //console.log(userObject);
			  if(userObject == null || userObject == {}){
			  	resolve({});
			  }else{
			  	resolve(userObject.likedUnis);
			  }
		});
	});
}

function updateUserLikes(id, uniName){
	/**
	*@param: (Int) User id from google
	*@param: (String) University name that has been liked
	*@return: (Bool) True if operation was done successfully 
	**/

	let user  = mongoose.model('user');
	return new Promise(function(resolve, reject) {
	  	user.findOneAndUpdate({id:id},{$push:{likedUnis:uniName}},function (err, userObject) {
			  if (err) return reject(err);
			  else resolve(true);
		});
	});
}

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
		lastLog: new Date(),
		likedUnis: []
      });
      newUser.save(function (err) {
        if (err) return console.error(err);
      });
}


module.exports = {userExists : userExists, createUser: createUser, updateUserLikes:updateUserLikes, getUserLikes:getUserLikes};