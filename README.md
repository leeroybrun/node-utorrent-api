# node-utorrent-api

Node.js wrapper arround the uTorrent Web API.

# Usage

```javascript
var Client = require('utorrent-api');

var utorrent = new Client('localhost', '22222');
utorrent.setCredentials('admin', '123456');

utorrent.fetchToken(function(err) {
	if(err) { console.log(err); return; }

	utorrent.call('list', function(err, data) {
		if(err) { console.log(err); return; }

		console.log(data);
	});
});
```