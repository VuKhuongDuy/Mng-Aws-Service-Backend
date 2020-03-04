FROM node:alpine

EXPOSE 3000

WORKDIR ./home

COPY . ./

RUN npm install

CMD node app.js

# RUN npm install