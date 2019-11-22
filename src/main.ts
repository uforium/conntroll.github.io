async function onClick(){
  let inputElem : HTMLInputElement = <HTMLInputElement>document.getElementById("api");
  let api : string = inputElem.value;
  console.log("fetching", api);
  const resp = await fetch(api);
  const agents = await resp.json();
  for(var i in agents){
    // console.log("client", i);
    let agent = agents[i];
    let agentJSON = {
      id: agent.id[0],
      pwd: agent.pwd[0],
      whoami: agent.whoami[0],
      hostname: agent.hostname[0]
    };
    console.log(agentJSON);
    //console.log(JSON.stringify(agentJSON));
  }
}

function main() {
  let buttonElem : HTMLButtonElement = <HTMLButtonElement>document.getElementById("list");
  buttonElem.onclick = onClick;
}

window.onload = main;
