var Client = require('../lib/utorrent');
var fs = require('fs');

var utorrent = new Client('localhost', '22222');
utorrent.setCredentials('admin', '123456');

utorrent.fetchToken(function(err) {
	if(err) { console.log(err); return; }

	utorrent.call('getprops', {'hash': 'DAAC7008E2E3A6E4321950C131690ACA20C5A08A'}, function(err, data) {
		if(err) { console.log('error : '); console.log(err); return; }

		console.log(data);
	});
});