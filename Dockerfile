# SkyLedger MariaDB Database Image
# Builds on official latest MariaDB image with schema initialization

FROM mariadb:latest

# Copy database schema to entrypoint directory
# Docker MariaDB entrypoint executes *.sql files in this folder on first boot
COPY database/schema.sql /docker-entrypoint-initdb.d/01-schema.sql

# Expose MariaDB port
EXPOSE 3306

# Healthcheck: verify MariaDB is accepting connections
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD healthcheck.sh --connect --innodb_initialized || exit 1

CMD ["mariadbd"]
