FROM mhart/alpine-node:10

# Create directory for application
RUN mkdir -p /opt/app-root/src
WORKDIR /opt/app-root/src

# Dependencies are installed here
COPY package.json .
RUN npm install --only=prod

# App source
COPY . .

EXPOSE 8080
CMD ["npm", "start"]
