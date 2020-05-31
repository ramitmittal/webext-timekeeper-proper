#!/usr/bin/env bash

rm -rf dist/ artifacts/
mkdir dist artifacts

cp -r src/manifest.json src/icons dist

parcel build src/popup/index.html src/background/index.html --out-dir dist/  --no-source-maps 

web-ext lint -s dist/

linterReturnCode=$?
if [ $linterReturnCode -ne 0 ]; then
  exit $retVal
fi

web-ext build -s dist/ -a artifacts/

git archive -o artifacts/$npm_package_name-$npm_package_version-source.zip HEAD
