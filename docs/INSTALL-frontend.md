# Installation of Federation Lab

Frontend is running in Node.js

SAML backend is using PHP.

OpenID Connect backend is using Python.


## Installing the Federation Lab Frontend



Setup a CNAME openidtest.uninett.no => federation-lab.uninett.no


Setup language

	unset LC_CTYPE LANG
	export LC_ALL="en_US.UTF-8"


Install some debian packages

	apt-get install libssl-dev python build-essential git python-software-properties libreadline-dev


Setup Node.js

	$ git clone git://github.com/creationix/nvm.git ~/.nvm$ . ~/.nvm/nvm.sh
	$ nvm ls
	$ nvm install v0.6.12
	$ nvm alias default v0.6.12
	$ nvm ls 
	$ nvm help


Installing npm

	curl http://npmjs.org/install.sh | sh


	npm install forever -gnpm install jsdom


	cd /vargit clone git://github.com/andreassolberg/fedlab.git


Oppsett av `/etc/init.d/fedlab` som bruker forever


Problems with jsdom was solved this way:


	$ npm install -g node-gyp
	$ cd
	$ git clone https://github.com/brianmcd/contextify.git
	$ cd contextify
	$ node-gyp clean
	$ node-gyp configure
	$ node-gyp build
	$ cd /var/fedlab/node_modules
	$ cp -r ~/contextify .
	$ cd ..
	$ npm install bindings






## Installing SAML backend engine



	apt-get install php5-cli php5-mcrypt php5-gmp php5-curl






