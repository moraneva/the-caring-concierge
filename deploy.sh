#!/bin/bash

set -eo pipefail

aws --profile evan s3 sync dist s3://the-caring-concierge

aws --profile evan cloudfront create-invalidation --distribution-id E3IAC5OJFY5YJK --paths /*