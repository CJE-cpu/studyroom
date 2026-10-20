#!/bin/sh
set -eu
keytool -importcert -noprompt -alias aiven -file /etc/secrets/aiven-ca.pem \
  -keystore /tmp/aiven-truststore.p12 -storetype PKCS12 -storepass changeit >/dev/null
exec java -Djavax.net.ssl.trustStore=/tmp/aiven-truststore.p12 \
  -Djavax.net.ssl.trustStorePassword=changeit -jar /app/app.jar
