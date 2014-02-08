var request = require('request');
var util = require('util')

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

		var self = this;

		// Callback used when we call the makeCall() method for first time with a saved token. As the token may have expired, we need to check this and retry with new token if an error occurs.
		var retryCallback = function(err, data) {
			if(err && err instanceof TokenError) {
				this.fetchToken(function(err) {
					if(err) { callback(err); return; }

					self.makeCall(action, params, callback);
				});
			} else {
				callback(null, data);
			}
		}

		// Token may expire, so even if it is set, we must try again if an error occurs when requesting the method for first time
		if(this.token != null) {
			this.makeCall(action, params, retryCallback);
		} else {
			this.fetchToken(function(err) {
				if(err) { callback(err); return; }

				self.makeCall(action, params, callback);
			});
		}
	}

	this.makeCall = function(action, params, callback) {
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
			// TODO: check why sometimes uTorrent returns error "Can\'t add torrent: torrent is not valid bencoding" when adding torrent. Error by our side, or malformed torrent file ?
			reqOptions.multipart = [
	        	{
	        		'Content-Disposition': 'form-data; name="torrent_file"; filename="torrent_file.torrent"',
	        		/*'Content-Transfer-Encoding': 'binary',*/
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
					callback(new Error('uTorrent not running...'));
				} else {
					callback(err);
				}

			} else if(typeof body == 'object' && 'error' in body) {
				callback(new Error(body.error));

			} else if(res.statusCode != 200) { 
				if(res.statusCode == 401) {
					callback(new AuthError('Bad username or password.'));
				} else if(res.statusCode == 400) {
					callback(new TokenError('uTorrent API returned status code : 400'));
				} else {
					callback(new Error('uTorrent API returned status code : '+ res.statusCode));
				}

			} else {
				callback(null, body);
			}
		});
	}
}

/* Custom error objects */
var AbstractError = function (msg, constr) {
  Error.captureStackTrace(this, constr || this)
  this.message = msg || 'Error'
}
util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

var TokenError = function (msg) {
  TokenError.super_.call(this, msg, this.constructor)
}
util.inherits(TokenError, AbstractError);
TokenError.prototype.message = 'Token Error';

var AuthError = function (msg) {
  TokenError.super_.call(this, msg, this.constructor)
}
util.inherits(AuthError, AbstractError)
AuthError.prototype.message = 'Authentification Error'