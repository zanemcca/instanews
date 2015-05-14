
echo Cleaning up containers
echo Before
docker ps -a
echo
docker ps -a | grep 'Exited' | awk '{print $1}' | sudo xargs --no-run-if-empty docker rm
echo After
docker ps -a

echo Cleaning up images
echo Before
docker images
echo
docker rmi $(sudo docker images | grep "^<none>" | awk "{print $3}")
echo After
docker images
