
# Installing OpenID Connect Testing Engine


Find a directory where all should be installed.

First some necesssary tools

# setuptools

	$ wget http://pypi.python.org/packages/source/s/setuptools/setuptools-0.6c11.tar.gz#md5=7df2a529a074f613b509fb44feefe74e
	$ cd setuptools-0.6c11
	$ python setup.py install
	$ cd ..


## pip

	$ wget http://pypi.python.org/packages/source/p/pip/pip-1.1.tar.gz#md5=62a9f08dd5dc69d76734568a6c040508
	$ tar xzvf pip-1.1.tar.gz
	$ cd pip-1.1
	$ python setup.py install
	$ cd ..


## pcre

	$ apt-get install libpcre3
	$ apt-get install libpcre3-dev


## python-dev

	$ apt-get install python-dev


## swig

	$ wget http://prdownloads.sourceforge.net/swig/swig-2.0.4.tar.gz
	$ tar xvzf swig-2.0.4.tar.gz
	$ cd swig-2.0.4
	$ ./configure
	$ make
	$ make install
	$ cd ..


## importlib - only necessary if python version < 2.7

	$ pip install importlib


## py.test

	$ apt-get install python-py
	$ pip install pytest - to get a newer version


## The basic OpenID Connect/OAuth2 libraries

	$ git clone git://github.com/rohe/pyoidc.git
	$ cd pyoidc
	$ python setup.py install
	$ cd ..


## The oic test script

	$ git clone git://github.com/rohe/oictest.git
	$ cd oictest
	$ python setup.py install

