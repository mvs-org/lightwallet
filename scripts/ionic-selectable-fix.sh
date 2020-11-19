#!/bin/bash
FILE=node_modules/ionic-selectable/ionic-selectable.metadata.json

if test -f "$FILE"; then
        echo "found ionic-selectable plugin -- apply fix to build for production"
	sed -ie 's/"version":4/"version":3/g' $FILE
fi


