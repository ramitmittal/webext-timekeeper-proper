#!/usr/bin/env bash

rm -rf dist/
mkdir dist

cp -r src/manifest.json src/icons dist

parcel watch src/popup/index.html src/background/index.html --out-dir dist/ &
parcelProcess=$!

web-ext run -s dist/ &
webextProcess=$!

wait $parcelProcess $webextProcess
