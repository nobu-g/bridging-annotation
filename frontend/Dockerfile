FROM node:16-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

ENV REACT_APP_API_URL "http://localhost:9000/"
ENV CHOKIDAR_USEPOLLING true
CMD ["yarn", "start"]
