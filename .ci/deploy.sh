#!/usr/bin/env bash

image="btwiuse/k0sio:$(git describe --tags --always HEAD)"

ssh powerlaw-op docker stop k0sio
ssh powerlaw-op docker rm k0sio
ssh powerlaw-op docker run -dit --name k0sio -p 8001:80 --rm "${image}"
