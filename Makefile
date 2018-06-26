VIRTUAL_ENV ?= venv

.PHONY: install
install:
	if [ ! -f $(VIRTUAL_ENV)/bin/python3 ]; then python3 -m venv $(VIRTUAL_ENV); fi
	$(VIRTUAL_ENV)/bin/python3 -m pip install -r requirements.txt
	$(VIRTUAL_ENV)/bin/python3 -m pip install -r requirements-dev.txt
	npm install bower
	$(VIRTUAL_ENV)/bin/python3 manage.py bower install
	$(VIRTUAL_ENV)/bin/python3 manage.py migrate

.PHONY: install-hook
url=https://raw.githubusercontent.com/google/yapf/cfcf45fd197768e3c73826b6fe8ac69de667015b/plugins/pre-commit.sh
tmp:=$(shell mktemp -d)
install-hook:
	curl -o $(tmp)/pre-commit.sh "$(url)"
	chmod a+x $(tmp)/pre-commit.sh
	mv $(tmp)/pre-commit.sh .git/hooks/pre-commit

.PHONY: fixtures
fixtures:
	$(VIRTUAL_ENV)/bin/python3 manage.py loaddata django_zbp/fixtures/*-dev.json
	$(VIRTUAL_ENV)/bin/python3 manage.py load_bezirke
	$(VIRTUAL_ENV)/bin/python3 manage.py load_ortsteile
	$(VIRTUAL_ENV)/bin/python3 manage.py load_bplan --fromFixtures


.PHONY: watch
watch:
	$(VIRTUAL_ENV)/bin/python3 manage.py runserver 8005

.PHONY: release
release: export DJANGO_SETTINGS_MODULE ?= django_zbp.settings.build
release:
	npm install bower --silent
	$(VIRTUAL_ENV)/bin/python3 -m pip install -r requirements.txt -q
	$(VIRTUAL_ENV)/bin/python3 manage.py bower install
	$(VIRTUAL_ENV)/bin/python3 manage.py compress -v0
	$(VIRTUAL_ENV)/bin/python3 manage.py collectstatic --noinput -v0
