VIRTUAL_ENV ?= .

install:
	$(VIRTUAL_ENV)/bin/python3 -m pip install -r requirements.txt
	npm install
	$(VIRTUAL_ENV)/bin/python3 manage.py bower install
	$(VIRTUAL_ENV)/bin/python3 manage.py migrate

fixtures:
	$(VIRTUAL_ENV)/bin/python3 manage.py loaddata django_zbp/fixtures/*-dev.json
	$(VIRTUAL_ENV)/bin/python3 manage.py load_bezirke
	$(VIRTUAL_ENV)/bin/python3 manage.py load_ortsteile
	$(VIRTUAL_ENV)/bin/python3 manage.py load_bplan --fromFixtures
	$(VIRTUAL_ENV)/bin/python3 manage.py insert_addresses --fromFixtures
	$(VIRTUAL_ENV)/bin/python3 manage.py insert_numberless_addresses --fromFixtures


load_with_gdal:
	$(VIRTUAL_ENV)/bin/python3 manage.py load_bplan
	$(VIRTUAL_ENV)/bin/python3 manage.py load_all
	$(VIRTUAL_ENV)/bin/python3 manage.py load_addresses
	$(VIRTUAL_ENV)/bin/python3 manage.py load_numberless_addresses

watch:
	$(VIRTUAL_ENV)/bin/python3 manage.py runserver
