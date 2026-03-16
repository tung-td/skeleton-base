LOG_FILE="$HOME/.pm2/logs/bundle.log"

# pull code
git pull

# config node
export NODE_OPTIONS=--max-old-space-size=4096

source ~/.nvm/nvm.sh
nvm use 20 || {
  echo "Error: Failed to switch to Node.js version 20" >> $LOG_FILE
  exit 1
}

# install dependencies
echo "Start installing dependencies $(date +%Y-%m-%d-%T%Z)" >> $LOG_FILE

yarn install || {
  echo "Error: Yarn install in root directory failed" >> $LOG_FILE
  exit 1
}

cd web || {
  echo "Error: Failed to change directory to web" >> $LOG_FILE
  exit 1
}

yarn install || {
  echo "Error: Yarn install in web directory failed" >> $LOG_FILE
  exit 1
}

cd frontend || {
  echo "Error: Failed to change directory to frontend" >> $LOG_FILE
  exit 1
}

yarn install || {
  echo "Error: Yarn install failed" >> $LOG_FILE
  exit 1
}

# build frontend
echo "Start building frontend $(date +%Y-%m-%d-%T%Z)" >> $LOG_FILE

NODE_ENV='production' SHOPIFY_API_KEY="5d2e05434e537962c36d1212cf376314" yarn run build || {
  echo "Error: Build process failed" >> $LOG_FILE
  exit 1
}

echo "Done building frontend $(date +%Y-%m-%d-%T%Z)" >> $LOG_FILE

# build server
echo "Start building server $(date +%Y-%m-%d-%T%Z)" >> $LOG_FILE

cd .. || {
  echo "Error: Failed to change directory to web" >> $LOG_FILE
  exit 1
}

pm2 delete bundle_pwacommerce || {
  echo "Warning: Failed to delete pm2 process, it may not exist" >> $LOG_FILE
}

NODE_ENV='production' pm2 start --name bundle_pwacommerce ./yarn_serve.sh --log-date-format 'DD-MM HH:mm:ss.SSS' || {
  echo "Error: pm2 start failed" >> $LOG_FILE
  exit 1
}

pm2 save || {
  echo "Warning: Failed to save pm2 process list" >> $LOG_FILE
}

echo "Done building server $(date +%Y-%m-%d-%T%Z)" >> $LOG_FILE

