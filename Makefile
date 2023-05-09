VIRTUAL_ENV ?= venv
SOURCE_DIRS = bplan django_zbp

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

.PHONY: lint
lint:
	EXIT_STATUS=0; \
	$(VIRTUAL_ENV)/bin/isort --diff -c $(SOURCE_DIRS) ||  EXIT_STATUS=$$?; \
	$(VIRTUAL_ENV)/bin/flake8 $(SOURCE_DIRS) --exclude migrations,settings ||  EXIT_STATUS=$$?; \
	$(VIRTUAL_ENV)/bin/python manage.py makemigrations --dry-run --check --noinput || EXIT_STATUS=$$?; \
	exit $${EXIT_STATUS}

.PHONY: lint-quick
lint-quick:
	EXIT_STATUS=0; \
	$(VIRTUAL_ENV)/bin/python manage.py makemigrations --dry-run --check --noinput || EXIT_STATUS=$$?; \
	exit $${EXIT_STATUS}

.PHONY: lint-python-files
lint-python-files:
	EXIT_STATUS=0; \
	$(VIRTUAL_ENV)/bin/black $(ARGUMENTS) || EXIT_STATUS=$$?; \
	$(VIRTUAL_ENV)/bin/isort --diff -c $(ARGUMENTS) --filter-files || EXIT_STATUS=$$?; \
	$(VIRTUAL_ENV)/bin/flake8 $(ARGUMENTS) || EXIT_STATUS=$$?; \
	exit $${EXIT_STATUS}

.PHONY: lint-fix
lint-fix:
	EXIT_STATUS=0; \
	$(VIRTUAL_ENV)/bin/isort $(SOURCE_DIRS) ||  EXIT_STATUS=$$?; \
	exit $${EXIT_STATUS}


