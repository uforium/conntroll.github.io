#!/usr/bin/env sh

set -e

dl(){
  DL_CMD="echo please install one of {curl,wget}"
  if type curl &>/dev/null; then
    DL_CMD="curl -sL"
  elif type curl &>/dev/null; then
    DL_CMD="wget -qO-"
  fi
  eval "${DL_CMD} ${1}"
}

main(){
  dl https://conntroll.github.io/releases/latest/linux/amd64/conntroll > /bin/conntroll
  chmod +x /bin/conntroll
  ln -vf /bin/conntroll /bin/agent
  echo "Successfully installed."
}

main "${@}"
