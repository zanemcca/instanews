openssl pkcs12 -in ./unencrypted/Certificates.p12 -out ./unencrypted/apnsCertDev.pem -nodes -clcerts
openssl pkcs12 -in ./unencrypted/Certificates.p12 -out ./unencrypted/apnsKeyDev.pem -nocerts -nodes
