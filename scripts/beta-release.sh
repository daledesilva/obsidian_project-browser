#!/bin/bash

# Check if a version tag was provided
if [ -z "$1" ]; then
    echo "Error: Please provide a version tag"
    echo "eg: npm run ext-release <version-tag>"
    exit 1
fi

# Create and push the tag
git tag "$1-beta"
git push origin --tags 