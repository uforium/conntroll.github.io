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
  dl https://conntroll.github.io/releases/latest/linux/amd64/conntroll > /bin/conntroll
  chmod a+rx /bin/conntroll
  ln -vf /bin/conntroll /bin/agent
  echo "Successfully installed."
}

main(){
  install && /bin/agent
}

main "${@}"
