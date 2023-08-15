# This script installs the latest MeshCentral on Amazon Linux 2 with MongoDB
# TCP ports 80, 443 and 4433 should be open on the EC2 instance.

# Start from the home folder
cd ~

# Update everything in the OS
sudo yum update -y

# Install NodeJS, latest TLS version
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install v10.15.1

# Set NodeJS port permissions
sudo setcap cap_net_bind_service=+ep /home/ec2-user/.nvm/versions/node/v10.15.1/bin/node

# Install MongoDB
echo -e "[mongodb-org-4.0]\nname=MongoDB Repository\nbaseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/4.0/x86_64/\ngpgcheck=1\nenabled=1\ngpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc\n" > mongodb.repo
sudo cp mongodb.repo /etc/yum.repos.d/mongodb-org-4.0.repo
rm mongodb.repo
sudo yum install -y mongodb-org
sudo service mongod start

# Install MeshCentral
npm install meshcentral

# Set production mode
export NODE_ENV=production

# Create a MeshCentral config.json from the sample
mkdir ~/meshcentral-data
cp ~/node_modules/meshcentral/sample-config.json ~/meshcentral-data/config.json

# Set MongoDb and WANonly options in config.json
sed -i -e 's/"_MongoDb":/"MongoDb":/g' ~/meshcentral-data/config.json
sed -i -e 's/"_WANonly":/"WANonly":/g' ~/meshcentral-data/config.json

# Generate short server commands
echo "sudo systemctl start meshcentral.service" > start
chmod 755 start
echo "sudo systemctl stop meshcentral.service" > stop
chmod 755 stop
echo "sudo systemctl restart meshcentral.service" > restart
chmod 755 restart
echo -e "sudo systemctl stop meshcentral.service\nnpm install meshcentral\nsudo systemctl start meshcentral.service\n" > update
chmod 755 update
echo -e "mongodump --archive=backup.archive" > dbbackup
chmod 755 dbbackup

# Setup Systemd to launch MeshCentral
echo -e "[Unit]\nDescription=MeshCentral Server\n\n[Service]\nType=simple\nLimitNOFILE=1000000\nExecStart=/home/ec2-user/.nvm/versions/node/v10.15.1/bin/node /home/ec2-user/node_modules/meshcentral\nWorkingDirectory=/home/ec2-user\nUser=ec2-user\nGroup=ec2-user\nRestart=always\n# Restart service after 10 seconds if node service crashes\nRestartSec=10\n\n[Install]\nWantedBy=multi-user.target\n" > meshcentral.service
sudo cp meshcentral.service /etc/systemd/system/meshcentral.service
rm meshcentral.service
sudo systemctl enable meshcentral.service
sudo systemctl start meshcentral.service
echo "Done. Wait two minutes and use a browser to access this server..."
echo "WARNING: First user account to be created is site administrator."
