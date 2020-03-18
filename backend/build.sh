#!/bin/bash

set -euo pipefail # exit on error; treat unset variables as errors; exit on errors in piped commands
SELF_DIR="$(perl -e 'use File::Basename; use Cwd "abs_path"; print dirname(abs_path(@ARGV[0]));' -- "$0")" # figure out the absolute path to the current script, regardless of pwd (perl is more cross-platform than realpath; https://stackoverflow.com/a/30795461)
PATH=$PATH:$SELF_DIR/node_modules/.bin # for running npm "binaries"
cd $SELF_DIR # ensure correct pwd

# Check that we're running the correct version of node
check-node-version --package

# Compile TypeScript into "temp" (defined is tsconfig.json)
tsc

# Install production dependencies under "temp"
cp package*.json temp
(cd temp && npm install --production)

# Create Lambda zipfile under "dist"
(cd temp && zip -r ../dist/backend-lambda.zip *)

# Clean up
rm -rf temp
