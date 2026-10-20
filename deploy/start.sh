#!/bin/sh
set -eu
ca_file=/etc/secrets/aiven-ca.pem
if [ ! -r "$ca_file" ] || [ ! -s "$ca_file" ]; then
  echo "STARTUP ERROR: Add a readable, non-empty Render Secret File named aiven-ca.pem (Environment > Secret Files)." >&2
  exit 1
fi
trust_dir=$(mktemp -d /tmp/studyroom-trust.XXXXXX)
trust_store="$trust_dir/truststore.p12"
echo "Importing Aiven CA certificate..."
if ! keytool -importcert -noprompt -alias aiven -file "$ca_file" \
  -keystore "$trust_store" -storetype PKCS12 -storepass changeit; then
  echo "STARTUP ERROR: CA import failed. Secret File contents must be the full PEM certificate, not a Windows file path." >&2
  exit 1
fi
echo "Starting Studyroom server..."
exec java -Djavax.net.ssl.trustStore="$trust_store" \
  -Djavax.net.ssl.trustStorePassword=changeit -jar /app/app.jar
