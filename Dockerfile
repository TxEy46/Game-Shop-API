# ใช้ Node.js เวอร์ชัน LTS
FROM node:18

# ตั้ง working directory
WORKDIR /usr/src/app

# คัดลอกไฟล์ package.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมด
COPY . .

# Build TypeScript
RUN npm run build

# เปิด port 3000
EXPOSE 3000

# รัน API
CMD ["node", "dist/server.js"]
