# node-utorrent-api

[![NPM](https://nodei.co/npm/utorrent-api.png)](https://nodei.co/npm/utorrent-api/)

Node.js wrapper arround the uTorrent Web API.

## Basic Usage

Here is the basic usage of this module.
You can find an advanded list of methods supported by uTorrent Web UI API [on their website](http://www.utorrent.com/intl/en/community/developers/webapi#devs2).

First you need to instanciate a new client object, and then set the credentials used to connect to the uTorrent Web UI.

Then you can do your calls to the API.

## Methods

Here are the available methods :

### utorrent.setCredentials(username, password)

Set the credentials used to access the uTorrent Web UI.

### utorrent.fetchToken(callback)

Fetch the token which will be used in each subsequent API calls. This method is directly called before an API call if needed, you don't need to call it by yourself.

Return an error to the callback, if an error occured when accessing the uTorrent API.

### utorrent.call(action, [params], callback)

Call the specified API action. If the action do not require params (like 'list'), this argument can be ignored.

If you want to use the 'add-file' method, just specify a 'torrent_file' param with a buffer containing the torrent file to upload to the API.

Return an error to the callback (if one appeared) and an object containing the result sent back by the API.

## Examples

### Request the torrents list

```javascript
var Client = require('utorrent-api');

var utorrent = new Client('localhost', '22222');
utorrent.setCredentials('admin', '123456');

utorrent.call('list', function(err, torrents_list) {
	if(err) { console.log(err); return; }

	console.log(torrents_list);
});
```

### Add torrent file

```javascript
var request = require('request');
var Client = require('utorrent-api');
var fs = require('fs');

var utorrent = new Client('localhost', '22222');
utorrent.setCredentials('admin', '123456');

request({'uri' : 'http://releases.ubuntu.com/13.04/ubuntu-13.04-desktop-i386.iso.torrent', 'encoding': null}, function (error, response, torrentFileBuffer) {
	utorrent.call('add-file', {'torrent_file': torrentFileBuffer}, function(err, data) {
		if(err) { console.log('error : '); console.log(err); return; }

		console.log('Successfully added torrent file !');
		console.log(data);
	});
});
```

### Get torrent details

```javascript
var Client = require('utorrent-api');
var fs = require('fs');

var utorrent = new Client('localhost', '22222');
utorrent.setCredentials('admin', '123456');

utorrent.call('getprops', {'hash': 'daac7008e2e3a6e4321950c131690aca20c5a08a'}, function(err, data) {
	if(err) { console.log('error : '); console.log(err); return; }

	console.log(data);
});
```

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/leeroybrun/node-utorrent-api/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
