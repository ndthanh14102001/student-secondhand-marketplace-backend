FROM node:18-alpine as development
WORKDIR /app
COPY ["package*.json", "./"]
RUN ["npm", "install"]
COPY ["./","./"]

FROM node:18-alpine as builder
WORKDIR /app
COPY --from=development /app/node_modules ./node_modules
COPY ["./","./"]
RUN ["npm", "run", "build"]


FROM node:18-alpine as production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
CMD ["npm", "run", "start"]
