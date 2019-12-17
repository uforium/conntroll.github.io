function getApi() : string{
  let inputElem : HTMLInputElement = <HTMLInputElement>document.getElementById("api");
  let api : string = inputElem.value;
  return api
}

async function apiAgents() : Promise<Agent[]>{
  let api = getApi();
  let path = "/api/agents/";
  let url = api + path;
  let agents : Agent[] = [];
  const resp = await fetch(url);
  const jsonArray = await resp.json();
  for(let elem of jsonArray){
    agents.push(createAgent(elem));
  }
  return agents;
}

async function onClick(){
  let agents : Agent[] = await apiAgents();
  clearAgentsAndSummary();
  for(let agent of agents){
    appendAgent(agent);
  }
  updateSummary(agents.length);
}

function createAgent(agent : any) : Agent{
  let agentJSON = {
    id: agent.id[0],
    pwd: agent.pwd[0],
    whoami: agent.whoami[0],
    hostname: agent.hostname[0]
  };
  return agentJSON;
}

interface Agent {
  id : string;
  pwd : string;
  whoami : string;
  hostname : string;
}

function appendAgent(agent : Agent){
  let api = getApi();
  let base = '/agent/';
  let url = api + base + agent.id + '/';
  let agentsElem : HTMLDivElement = <HTMLDivElement>document.getElementById("agents");
  let hrElem = document.createElement('hr');
  let hr2Elem = document.createElement('hr');
  let childElem = document.createElement('div');
  let infoSubelem = document.createElement('pre');
  let aSubelem = document.createElement('a');

  infoSubelem.innerHTML = agent.whoami + '@' + agent.hostname + ' ' + agent.pwd + ' $';
  aSubelem.innerHTML = 'ws';
  aSubelem.setAttribute('target', '_blank');
  aSubelem.setAttribute('href', url);

  childElem.setAttribute("id", agent.id);
  childElem.appendChild(infoSubelem);
  childElem.appendChild(aSubelem);

  agentsElem.appendChild(hrElem);
  agentsElem.appendChild(childElem);
  agentsElem.appendChild(hr2Elem);
}

function updateSummary(i : number){
  let summaryElem : HTMLDivElement = <HTMLDivElement>document.getElementById("summary");
  let date = new Date();
  let offset = date.getTimezoneOffset();
  summaryElem.innerHTML = (date + offset).toISOString() + ' ' + i.toString() + ' Agents Found';
}

function clearAgentsAndSummary(){
  let listElem : HTMLDivElement = <HTMLDivElement>document.getElementById("agents");
  let summaryElem : HTMLDivElement = <HTMLDivElement>document.getElementById("summary");
  listElem.innerHTML = "";
  summaryElem.innerHTML = "";
}

function main() {
  let buttonElem : HTMLButtonElement = <HTMLButtonElement>document.getElementById("list");
  buttonElem.onclick = onClick;
}

window.onload = main;
