var request = require('request');

var uTorrentClient = module.exports = function(host, port) {
	this.rootUrl = 'http://'+ host +':'+ port +'/gui';
	this.username = null;
	this.password = null;
	this.token = null;
	this.cookies = request.jar();

	this.setCredentials = function(user, pass) {
		this.username = user;
		this.password = pass;
	}

	this.fetchToken = function(callback) {
		var self = this;

		this.makeRequest({path: '/token.html'}, function(err, body) {
			if(err) { callback(err); return; }

			var regex = new RegExp('<div id=(?:\'|")token(?:\'|")[^>]+>(.*)</div>');
            var matches = regex.exec(body);

            if(matches != null && matches.length > 1) {
                self.token = matches[1];
                callback(null);
            } else {
            	callback('Cannot find token in response body.');
            }
		});
	}

	this.call = function(action, params, callback) {
		// If no params was passed
		if(typeof params == 'function') {
			callback = params;
			params = {};
		}

		if(action == 'list') {
			params.list = '1';
		} else {
			params.action = action;
		}
		
		params.token = this.token;

		this.makeRequest({'qs': params}, function(err, body) {
			if(err) { callback(err, null); return; }

			callback(null, JSON.parse(body));
		});
	}

	this.makeRequest = function(options, callback) {
		var reqOptions = {
			'method': options.method || 'GET',
			'uri': (options.path) ? this.rootUrl + options.path : this.rootUrl + '/',
			'auth': {
				'user': this.username,
				'pass': this.password,
				'sendImmediately': false
			},
			'jar': this.cookies
		};

		if('qs' in options) {
	        reqOptions.qs = options.qs;
	    }
		if('form' in options) {
	        reqOptions.form = options.form;
	    }
	    
	    // Send the request
	    request(reqOptions, function(err, res, body) {
			if(err) { 
				callback(err, null); 
			} else if(res.statusCode != 200) { 
				callback('uTorrent API returned status code : '+ res.statusCode, null);
			} else {
				callback(null, body)
			}
		});
	}
}