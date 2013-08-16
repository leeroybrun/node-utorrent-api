var request = require('request');
var utorrentClient = require('../lib/utorrent');
var fs = require('fs');

var utorrent = new utorrentClient('localhost', '22222');
utorrent.setCredentials('admin', '123456');

utorrent.fetchToken(function(err) {
	if(err) { console.log(err); return; }

	request({'uri' : 'http://releases.ubuntu.com/13.04/ubuntu-13.04-desktop-i386.iso.torrent', 'encoding': null}, function (error, response, body) {
		utorrent.call('add-file', {'torrent_file': body}, function(err, data) {
			if(err) { console.log('error : '); console.log(err); return; }

			console.log('Add torrent action return :');
			console.log(data);
		});
	});
});

