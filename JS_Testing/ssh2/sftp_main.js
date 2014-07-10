var requirejs = require('requirejs');
requirejs.config({nodeRequire: require});
requirejs(['SFTPClient'], 
	function(SFTPClient) {
		SFTPClient.setConnection(
					'SomeName',
		      			'host', port, 
					'username', 'privateKey', 'password');
		var connName = 'SomeName';
		var directory = 'remoteDirectory';
		var downloadDir = 'localDirectory';
		var fileType = 'filesExtToLookFor';

		var files = getFilesFromDir(connName, directory, fileType, true);
		
		function checkConnection(connName) {
			SFTPClient.checkConnection(connName, function(err, type, data) {
				if (err) throw type + err;
				console.log('Callback: ' + type + ' Connected\n');
				return true;
			});
		}

		function getFilesFromDir(connName, dir, fileType, doDownload) {
			var files = [];
			SFTPClient.getDirContents(connName, dir, function(err, type, data) {
				if (err) throw type + err;
				console.log('Callback ' + type + ' Green\n');
				for(var i=0;i<data.length;i++) {
					var obj = data[i];
					obj.fileExt = obj.filename.split('.').pop();
					if(obj.fileExt == fileType) {files.push(obj);}	
				}
				if(doDownload) {downloadFiles(connName, dir, downloadDir, files);}
				return files;
			});
		}

		function downloadFiles(connName, remoteDir, localDir, files) {
			SFTPClient.downloadFiles(connName, remoteDir, localDir, files, function(errs, type) {
				var filesDownloaded = 0;
				for(var i=0;i<errs.length;i++) {
					var err = errs[i].error;
					if (err) {console.log('Error: ' + type); throw err;}
					filesDownloaded++;
				}
				console.log('Callback ' + type + ' downloaded ' + filesDownloaded + ' files');
			});
		}
	}
);

