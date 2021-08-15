FROM node:14
WORKDIR /App
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9000
EXPOSE 6379
CMD ["npm", "run", "server"]
