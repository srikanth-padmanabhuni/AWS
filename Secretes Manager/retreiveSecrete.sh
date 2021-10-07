#!/bin/bash

SECRET_KEY=<YOUR_SECRETE_KEY_ID>

# Get entire secret JSON
aws secretsmanager get-secret-value \
  --secret-id $SECRET_KEY

# Get just the SecretString from the entire JSON
aws secretsmanager get-secret-value \
  --secret-id $SECRET_KEY \
  --query SecretString

# Get the String without quotes i.e as a string format
aws secretsmanager get-secret-value \
  --secret-id $SECRET_KEY \
  --query SecretString \
  --output text

# Install jq on MacOS with Homebrew - brew install jq
# Get the secret and parse with jq to get specific dara from secrete 
# Here getting username from the output secrete
aws secretsmanager get-secret-value \
  --secret-id $SECRET_KEY \
  --query SecretString \
  --output text \
  | jq -r .username