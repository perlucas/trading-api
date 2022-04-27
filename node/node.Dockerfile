FROM node

WORKDIR /home/node/app

COPY *.js .
COPY *.json .
COPY ./src .

RUN npm install

USER node

CMD npm start