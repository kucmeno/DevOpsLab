FROM node:alpine

WORKDIR /opt/app

COPY /package.json .

RUN unset HOST

RUN yarn install

COPY . .

CMD [“yarn”, “start”]

