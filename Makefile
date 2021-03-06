VIRTUAL_ENV ?= venv

.PHONY: install
install:
	if [ ! -f $(VIRTUAL_ENV)/bin/python3 ]; then python3 -m venv $(VIRTUAL_ENV); fi
	$(VIRTUAL_ENV)/bin/python3 -m pip install -r requirements.txt
	$(VIRTUAL_ENV)/bin/python3 -m pip install -r requirements-dev.txt
	$(VIRTUAL_ENV)/bin/python3 manage.py migrate
	npm install --no-save
	npm run build

.PHONY: fixtures
fixtures:
	$(VIRTUAL_ENV)/bin/python3 manage.py loaddata django_zbp/fixtures/*-dev.json
	$(VIRTUAL_ENV)/bin/python3 manage.py load_bezirke
	$(VIRTUAL_ENV)/bin/python3 manage.py load_ortsteile
	$(VIRTUAL_ENV)/bin/python3 manage.py load_bplan --fromFixtures

.PHONY: watch
watch:
	trap 'kill %1' KILL; \
	npm run watch & \
	$(VIRTUAL_ENV)/bin/python3 manage.py runserver 8005

.PHONY: release
release: export DJANGO_SETTINGS_MODULE ?= django_zbp.settings.build
release:
	npm install --no-save
	npm run build:prod
	$(VIRTUAL_ENV)/bin/python3 -m pip install -r requirements.txt -q
	$(VIRTUAL_ENV)/bin/python3 manage.py collectstatic --noinput -v0 --ignore firebug-lite

.PHONY: compile-scss
compile-scss:
	$(VIRTUAL_ENV)/bin/sassc bplan/assets/scss/all.scss bplan/assets/css/all.css

.PHONY: clean
clean:
	if [ -f package-lock.json ]; then rm package-lock.json; fi
	if [ -d node_modules ]; then rm -rf node_modules; fi
	if [ -d venv ]; then rm -rf venv; fi
