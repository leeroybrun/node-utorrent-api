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

		var options = {
			'method': 'GET',
			'qs': {}
		};

		// POST action
		if(action == 'add-file') {
			options.method = 'POST';
			options.form = params;
			options.qs.action = action;

		// GET actions
		} else {
			options.qs = params;

			if(action == 'list') {
				options.qs.list = '1';
			} else {
				options.qs.action = action;
			}
		}
		
		options.qs.token = this.token;

		this.makeRequest(options, function(err, body) {
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
			reqOptions.multipart = [
	        	{
	        		'Content-Disposition': 'form-data; name="torrent_file"; filename="torrent_file.torrent"',
	        		'Content-Type': 'application/x-bittorrent',
	        		'body': options.form.torrent_file
	        	},
	        	{ 'body': options.form.torrent_file }
	        ];

	        reqOptions.headers = {
	        	'content-type': 'multipart/form-data'
	        }

	        reqOptions.method = 'POST';
	    }
	    
	    // Send the request
	    var req = request(reqOptions, function(err, res, body) {
			if(err) {
				if('code' in err && err.code == 'ECONNREFUSED') {
					callback('uTorrent not running...', null);
				} else {
					callback(err, null);
				}
			} else if(res.statusCode != 200) { 
				if(res.statusCode == 401) {
					callback('Bad username or password.', null);
				} else {
					callback('uTorrent API returned status code : '+ res.statusCode, null);
				}
			} else {
				callback(null, body);
			}
		});
	}
}