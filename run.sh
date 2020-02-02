#!/usr/bin/env sh

set -e

dl(){
  DL_CMD="echo please install one of {curl,wget}"
  if type curl 2>/dev/null 1>&2; then
    DL_CMD="curl -sL"
  elif type busybox 2>/dev/null 1>&2; then
    DL_CMD="busybox wget -qO-"
  elif type wget 2>/dev/null 1>&2; then
    DL_CMD="wget -qO-"
  fi
  eval "${DL_CMD} ${1}"
}

install(){
  dl https://k0s.io/releases/latest/linux/amd64/k0s > /tmp/k0s
  chmod a+rx /tmp/k0s
  echo "Successfully saved k0s to /tmp."
}

main(){
  install && /tmp/k0s "${@}"
}

main "${@}"
