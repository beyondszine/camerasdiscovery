#!/bin/bash

echo "this is from pre-commit hook"

echo "Args passed to this hook $1-$2"
FILES_PATTERN='\.(js|coffee)(\..+)?$'
FORBIDDEN='console.log'
git diff --cached --name-only | \
    grep -E $FILES_PATTERN | \
    GREP_COLOR='4;5;37;41' xargs grep --color --with-filename -n $FORBIDDEN && echo 'COMMIT REJECTED Found "$FORBIDDEN" references. Please remove them before commiting' && exit 1
# exit 1