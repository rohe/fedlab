# Installation of Federation Lab

Frontend is running in Node.js

SAML backend is using PHP.

OpenID Connect backend is using Python.


## Installing the Federation Lab Frontend

Setup a [node.js](http://nodejs.org) environment with a recent version of Node.js, such as 10.x.

Enter the frontend directory.

	cd frontend

Install dependencies

	npm install


Then prepare the configuration file

	cp etc/config.template.js etc/config.js

Edit the path of the app, and the hostname in config.js.

Then start the app in any of the following ways:

* Start directly with `node app`
* Start with npm, running `npm start`
* Or start with foreman `foreman start`


Notice that the frontend will not work properly until it is successfully connected to one or more backends.




## Installing SAML backend engine



	apt-get install php5-cli php5-mcrypt php5-gmp php5-curl






