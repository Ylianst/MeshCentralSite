# This script installs the latest MeshCentral on Microsoft Azure with Ubuntu 18.04
# Username must set to "default"
# TCP ports 22, 80, 443, 3389 should be open on the instance, you can use basic network settings to do this.

# Start from the home folder
cd ~

# Install NodeJS
sudo apt-get install -y npm
sudo apt-get install -y nodejs

# Set NodeJS port permissions
sudo setcap cap_net_bind_service=+ep /usr/bin/node

# Install MeshCentral
npm install meshcentral

# Set production mode
export NODE_ENV=production

# Create a MeshCentral config.json from the sample
mkdir ~/meshcentral-data
cp ~/node_modules/meshcentral/sample-config.json ~/meshcentral-data/config.json

# Set WANonly and MPS port options in config.json
sed -i -e 's/"_WANonly":/"WANonly":/g' ~/meshcentral-data/config.json
sed -i -e 's/"_RedirPort": 80/"MpsPort": 3389/g' ~/meshcentral-data/config.json

# Generate short server commands
echo "sudo systemctl start meshcentral.service" > start
chmod 755 start
echo "sudo systemctl stop meshcentral.service" > stop
chmod 755 stop
echo "sudo systemctl restart meshcentral.service" > restart
chmod 755 restart
echo -e "sudo systemctl stop meshcentral.service\nnpm install meshcentral\nsudo systemctl start meshcentral.service\n" > update
chmod 755 update

# Setup Systemd to launch MeshCentral
echo -e "\n[Unit]\nDescription=MeshCentral Server\n\n[Service]\nType=simple\nLimitNOFILE=1000000\nExecStart=/usr/bin/node /home/default/node_modules/meshcentral\nWorkingDirectory=/home/default\nUser=default\nGroup=default\nRestart=always\n# Restart service after 10 seconds if node service crashes\nRestartSec=10\n\n[Install]\nWantedBy=multi-user.target\n" > meshcentral.service
sudo cp meshcentral.service /etc/systemd/system/meshcentral.service
rm meshcentral.service
sudo systemctl enable meshcentral.service
sudo systemctl start meshcentral.service
echo "Done. Wait two minutes and use a browser to access this server..."
echo "WARNING: First user account to be created is site administrator."



