#!/bin/bash

# Delete local tag if it exists
git tag -d internal

# Delete remote tag if it exists
git push origin --delete internal

# Create new tag
git tag internal

# Push the new tag
git push origin --tags 