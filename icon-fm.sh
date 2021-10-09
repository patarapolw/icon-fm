#!/bin/bash

ROOTDIR="$(dirname $0)"
PYTHON="$(PIPENV_PIPFILE="$ROOTDIR/Pipfile" pipenv --venv)/bin/python"

"$PYTHON" "$ROOTDIR/app.py"
