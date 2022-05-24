FROM node:14.16.1

WORKDIR /backend

COPY package.json ./

RUN npm install
COPY . .
EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]