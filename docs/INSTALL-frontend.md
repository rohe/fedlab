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





## Installing OpenID Connect Testing Engine


Find a directory where all should be installed.

First some necesssary tools

- setuptools -

	$ wget http://pypi.python.org/packages/source/s/setuptools/setuptools-0.6c11.tar.gz#md5=7df2a529a074f613b509fb44feefe74e
	$ cd setuptools-0.6c11
	$ python setup.py install
	$ cd ..


- pip -

	$ wget http://pypi.python.org/packages/source/p/pip/pip-1.1.tar.gz#md5=62a9f08dd5dc69d76734568a6c040508
	$ tar xzvf pip-1.1.tar.gz
	$ cd pip-1.1
	$ python setup.py install
	$ cd ..


- pcre -

	$ apt-get install libpcre3
	$ apt-get install libpcre3-dev


- python-dev -

	$ apt-get install python-dev


- swig -

	$ wget http://prdownloads.sourceforge.net/swig/swig-2.0.4.tar.gz
	$ tar xvzf swig-2.0.4.tar.gz
	$ cd swig-2.0.4
	$ ./configure
	$ make
	$ make install
	$ cd ..


- importlib - only necessary if python version < 2.7

	$ pip install importlib


- py.test -

	$ apt-get install python-py
	$ pip install pytest - to get a newer version


- The basic OpenID Connect/OAuth2 libraries

	$ git clone git://github.com/rohe/pyoidc.git
	$ cd pyoidc
	$ python setup.py install
	$ cd ..


- The oic test script

	$ git clone git://github.com/rohe/oictest.git
	$ cd oictest
	$ python setup.py install



