openssl pkcs12 -in Certificates.p12 -out apnsCertDev.pem -nodes -clcerts
openssl pkcs12 -in Certificates.p12 -out apnsKeyDev.pem -nocerts -nodes
