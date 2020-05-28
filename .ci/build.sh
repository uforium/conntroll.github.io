#!/usr/bin/env bash

export DOCKER_BUILDKIT=1

docker version

refs=(
  btwiuse/k0sio:$(git describe --tags --always HEAD)
  btwiuse/k0sio:latest
)

for ref in "${refs[@]}"; do
  docker build -t "${ref}" .
  docker push "${ref}"
done
