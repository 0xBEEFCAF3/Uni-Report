const mongoose = require('mongoose');
var schema = mongoose.Schema;


var userSchema = new schema({
	firstName: String,
	secondName: String,
	email: String,
	lastLog: String
});
