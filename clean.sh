
echo Cleaning up containers
echo Before
sudo docker ps -a
echo
sudo docker ps -a | grep 'Exited' | awk '{print $1}' | sudo xargs --no-run-if-empty docker rm
echo After
sudo docker ps -a

echo Cleaning up images
echo Before
sudo docker images
echo
sudo docker rmi $(sudo docker images | grep "^<none>" | awk "{print $3}")
echo After
sudo docker images
