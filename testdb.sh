#!/bin/bash

echo "=========================================="
echo "LDPv2 - Database Diagnostics"
echo "=========================================="
echo ""

echo "1. Checking if user table exists:"
echo "-----------------------------------"
docker exec ldpv2-postgres psql -U ldpv2_user -d ldpv2 -c "\dt users"
echo ""

echo "2. Checking users in database:"
echo "-----------------------------------"
docker exec ldpv2-postgres psql -U ldpv2_user -d ldpv2 -c "SELECT id, username, email, role, created_at FROM users;"
echo ""

echo "3. Checking password hash for admin:"
echo "-----------------------------------"
docker exec ldpv2-postgres psql -U ldpv2_user -d ldpv2 -c "SELECT username, LEFT(password, 20) || '...' as password_hash FROM users WHERE username='admin';"
echo ""

echo "4. Checking all tables:"
echo "-----------------------------------"
docker exec ldpv2-postgres psql -U ldpv2_user -d ldpv2 -c "\dt"
echo ""

echo "5. Checking Liquibase changelog (executed migrations):"
echo "-----------------------------------"
docker exec ldpv2-postgres psql -U ldpv2_user -d ldpv2 -c "SELECT id, author, filename, dateexecuted, exectype FROM databasechangelog ORDER BY dateexecuted;"
echo ""

echo "6. Testing BCrypt hash verification:"
echo "-----------------------------------"
echo "The password 'admin123' should hash to something starting with \$2a\$10\$"
echo "Expected hash in initial-data.xml: \$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
echo ""

echo "=========================================="
echo "Diagnostics complete!"
echo "=========================================="