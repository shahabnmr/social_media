FROM node:22.12.0-alpine3.20

WORKDIR /app
COPY package.json .
RUN npm cache verify
RUN npm cache clean --force
RUN npm config set strict-ssl false
RUN npm install --only=prod
COPY . .

CMD ["npm","start"]