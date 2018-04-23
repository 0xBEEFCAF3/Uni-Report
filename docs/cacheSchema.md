The following is the schema used to cache API calls.

var cacheSchema = new schema({
	endpoint: String, 
	args: Object, //Arguments used when calling API
	response: Object, //API call response 
	lastUsed: String //JS Date object
});
