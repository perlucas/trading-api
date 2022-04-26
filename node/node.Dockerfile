FROM node

WORKDIR /home/node/app

COPY index.js index.js

# COPY package.json package.json

RUN npm install

USER node