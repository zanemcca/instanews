# Instanews

Local Citizen Journalism in an elegant simple platform

## Development

## Production
### Build the image
sudo docker build -t instanews .
### Start database
sudo docker run -d --name mongodb mongo mongod --smallfiles
### Launch the instance
sudo docker run -d -p <HOST_PORT>:3000 --name <CONTAINER_NAME> --link mongodb:mongodb instanews
