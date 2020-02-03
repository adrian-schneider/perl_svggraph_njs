var fs = require('fs');

fs.watchFile('somefile.js', {interval: 1000}, function() {
  console.log('hi');
});

