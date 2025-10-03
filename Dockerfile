# ใช้ Node.js 22
FROM node:22

WORKDIR /usr/src/app

# คัดลอก package.json และติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# คัดลอก source code
COPY . .

# build TypeScript
RUN npx tsc

EXPOSE 3000

CMD ["node", "dist/server.js"]
