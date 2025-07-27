# Use an official, lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker's layer caching
# This step will only re-run if these files change, speeding up future builds
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application's code into the container
COPY . .

# Tell Docker that your app runs on port 3001
EXPOSE 3001

# The command to run your application when the container starts
CMD [ "node", "index.js" ]