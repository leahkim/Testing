define(['ssh2'], function(ssh2) {
	var self = {};
	self.ssh2 = ssh2;
	self.Connection = new ssh2();
	self.connections = {};

	self.setConnection = function(name, host, port, username, privateKey, password) {
		self.connections[name] = {host:host, port:port, username:username, privateKey:privateKey, password:password};
	}

	self.checkConnection = function(name, callback) {
		var connObj = self.connections[name];
		var conn = self.Connection; 
		conn.on('ready', function() {
		  console.log('Connecting: ' + connObj.username + '@' + connObj.host + ':' + connObj.port + '\n');
		  conn.sftp(function(err, sftp) {
		    	callback(err, 'conn.sftp', sftp);
		      	conn.end();
		      	console.log('\nClosing: ' + connObj.username + '@' + connObj.host + ':' + connObj.port + '\n');
		  });
		}).connect({
		  host: connObj.host,
		  port: connObj.port,
		  username: connObj.username,
		  privateKey: require('fs').readFileSync(connObj.privateKey),
		  password: connObj.password
		});
	}

	self.getDirContents = function(name, directory, callback) {
		var connObj = self.connections[name];
		var conn = new self.ssh2();
		conn.on('ready', function() {
		  console.log('Getting Directory:\n'
			 	    + directory + 
				     '\non\n'
				    + connObj.username + '@' + connObj.host + ':' + connObj.port + '\n');
		  conn.sftp(function(err, sftp) {
		    if(err) {callback(err, 'conn.sftp', sftp);}
		    sftp.readdir(directory, function(err, list) {
		      callback(err, 'sftp.readdir', list);
		      sftp.end();
		      conn.end();
		      console.log('\nClosing: ' + connObj.username + '@' + connObj.host + ':' + connObj.port + '\n');
		    });
		  });
		}).connect({
		  host: connObj.host,
		  port: connObj.port,
		  username: connObj.username,
		  privateKey: require('fs').readFileSync(connObj.privateKey),
		  password: connObj.password
		});
	}
	
	self.downloadFiles = function(name, remoteDir, localDir, files, callback) {
		var connObj = self.connections[name];
		var conn = self.Connection; 
		conn.on('ready', function() {
		  conn.sftp(function(err, sftp) {
		    if(err) {callback(err, 'conn.sftp', sftp);}
		    console.log('Downloading Files\n'
			   	      + remoteDir + 
			    		'\non\n'
				      + connObj.username + '@' + connObj.host + ':' + connObj.port + 
				      	'\nto\n'
				      + localDir + '.....');
		    var errs = [];
		    for(var i=0;i<files.length;i++) {
		    	var downPath = remoteDir + '/' + files[i].filename;
		    	var savePath = localDir + '/' + files[i].filename;
			var counter = i + 1
	    	    	console.log(counter + ' Downloading ' +  files[i].filename + '\n');	    
		    	sftp.fastGet(downPath, savePath, function(err) {
				var errObj = {error:err};	
				errs.push(errObj);
				if(errs.length == files.length) {
					callback(errs, 'sftp.fastGet');	
					conn.end();
		      			console.log('\nClosing: ' + connObj.username + '@' + connObj.host + ':' + connObj.port + '\n');
				}
		    	});
		    }
		  });
		}).connect({
		  host: connObj.host,
		  port: connObj.port,
		  username: connObj.username,
		  privateKey: require('fs').readFileSync(connObj.privateKey),
		  password: connObj.password
		});
	}

	return self;
});
