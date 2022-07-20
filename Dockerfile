# Use NodeJS LTS Slim image
FROM node:lts-slim

# Create app directory 
WORKDIR /app
VOLUME /app/data

# Install app dependencies
COPY package.json ./
RUN npm install

# Define number of UEs
ENV NUM_DEVICES="1"

# Copy remaning files
COPY . .

# Run JS file with Node
CMD [ "node", "index.js" ]

# How to run:
# docker build . -t lando/my5grantester-free5gb-database-filler
# docker run --rm -e NUM_DEVICES=10000 -v $(pwd)/data:/app/data lando/my5grantester-free5gb-database-filler