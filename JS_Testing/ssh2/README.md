Testing ssh2

Description:
$node sftp_main.js 
	 will download files from/to the specified directory on the specified server using SFTPClient.js

Functions:
check connection
list files in remote dir
download files of a certain file type

Setup:
Currently setup to call list files, which on completion will download files of specified type.

Dependencies: Node, ssh2, require
Notes: Probably not the cleanest use of connections and callbacks.
