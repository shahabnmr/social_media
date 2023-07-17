FROM node:14-alpine

WORKDIR /app
COPY package.json .
RUN npm update -g npm
RUN npm cache verify
RUN npm cache clean --force
RUN npm install --only=prod
COPY . .

CMD ["npm","start"]