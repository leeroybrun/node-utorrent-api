var request = require('request');
var Client = require('../lib/utorrent');
var fs = require('fs');

var utorrent = new Client('localhost', '22222');
utorrent.setCredentials('admin', '123456');

utorrent.fetchToken(function(err) {
	if(err) { console.log(err); return; }

	request({'uri' : 'http://releases.ubuntu.com/13.04/ubuntu-13.04-desktop-i386.iso.torrent', 'encoding': null}, function (error, response, torrentFileBuffer) {
		utorrent.call('add-file', {'torrent_file': torrentFileBuffer}, function(err, data) {
			if(err) { console.log('error : '); console.log(err); return; }

			console.log('Successfully added torrent file !');
			console.log(data);
		});
	});
});