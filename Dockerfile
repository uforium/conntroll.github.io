FROM node AS build-env-js
ADD . .
RUN npm install
RUN make

FROM golang AS build-env-go
RUN env CGO_ENABLED=0 go get github.com/btwiuse/gos

FROM alpine
WORKDIR /k0s.io
COPY index.html reset.css script.js style.css cover.png sequence-diagram.svg .
COPY --from=build-env-js dist/bundle.js dist/bundle.js
COPY --from=build-env-go /go/bin/gos /bin/gos
CMD ["/bin/gos", "-listen", ":80"]
