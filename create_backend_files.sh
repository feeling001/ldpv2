#!/bin/bash

# This script creates all backend files for Story 0

BASE_DIR="/home/feeling/Documents/Code/ldpv2/backend/src/main/java/com/ldpv2"

# Create all necessary directories
mkdir -p "$BASE_DIR"/{config,domain/{entity,enums},repository,service,dto/{request,response},controller,security,exception}
mkdir -p /home/feeling/Documents/Code/ldpv2/backend/src/main/resources/db/changelog/{v1.0,data}
mkdir -p /home/feeling/Documents/Code/ldpv2/backend/src/test/java/com/ldpv2/{service,controller,integration}

echo "Backend directory structure created successfully"
