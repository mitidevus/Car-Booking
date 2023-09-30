#Build stage
FROM golang:1.20.2-alpine3.17 as builder
WORKDIR /app
COPY . .
RUN go build -o main cmd/server/main.go
       
#Run stage
FROM alpine:3.17
WORKDIR /app
COPY --from=builder /app/main .
COPY config.yaml .

EXPOSE 8085
CMD [ "/app/main" ]