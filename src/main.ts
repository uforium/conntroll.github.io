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

var intervalIDs : number[] = [];
var watchExceptions : TypeError[] = [];

function cancelWatch(){
  while (intervalIDs.length > 0) {
    window.clearInterval(intervalIDs.pop());
  }
  watchExceptions.length = 0;
}

function startWatch(){
  let intervalID = window.setInterval(onListClick, 1000);
  intervalIDs.push(intervalID);
}

async function onWatchClick(){
  if (intervalIDs.length > 0) {
    cancelWatch();
    return
  }
  startWatch();
}

async function onListClick(){
  let agents : Agent[] = []
  try {
    console.log(intervalIDs.length, watchExceptions.length);
    agents = await apiAgents();
  } catch (e) {
    if (intervalIDs.length > 0) {
      watchExceptions.push(e);
    }
    updateSummaryException(e);
    return;
  } finally {
    if ((intervalIDs.length > 0) && (watchExceptions.length > 10)) {
      cancelWatch();
    }
  }
  updateAgents(agents);
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

function createAgentElem(agent : Agent) : HTMLDivElement {
  let api = getApi();
  let base = '/agent/';
  let url = api + base + agent.id + '/';

  let childElem = document.createElement('div');
  let infoSubelem = document.createElement('pre');
  let aSubelem = document.createElement('a');
  let hrElem = document.createElement('hr');
  let hr2Elem = document.createElement('hr');

  infoSubelem.innerHTML = agent.whoami + '@' + agent.hostname + ' ' + agent.pwd + ' $';
  aSubelem.innerHTML = 'ws';
  aSubelem.setAttribute('target', '_blank');
  aSubelem.setAttribute('href', url);

  childElem.setAttribute("id", agent.id);
  childElem.appendChild(hrElem);
  childElem.appendChild(infoSubelem);
  childElem.appendChild(aSubelem);
  childElem.appendChild(hr2Elem);

  return childElem;
}

function difference(A : Set<string>, B : Set<string>) : Set<string> {
  var AminusB = new Set<string>(A);
  for (var elem of B) {
    if (AminusB.has(elem)) {
      AminusB.delete(elem);
    }
  }
  return AminusB;
}

function updateAgents(agents : Agent[]){
  let agentsContainerElem : HTMLDivElement = <HTMLDivElement>document.getElementById("agents");
  let existingAgentIDs : Set<string> = new Set<string>();
  let newAgentIDs : Set<string> = new Set<string>();

  for (let child of agentsContainerElem.childNodes) {
    existingAgentIDs.add((<HTMLDivElement>child).id);
  }

  for (let agent of agents) {
    newAgentIDs.add(agent.id);
  }

  let del : Set<string> = difference(existingAgentIDs, newAgentIDs);
  let add : Set<string> = difference(newAgentIDs, existingAgentIDs);

  for (let child of agentsContainerElem.childNodes) {
    if (del.has((<HTMLDivElement>child).id)) {
      agentsContainerElem.removeChild(child);
    }
  }

  for (let agent of agents) {
    if (add.has(agent.id)) {
      let childElem : HTMLDivElement = createAgentElem(agent);
      agentsContainerElem.appendChild(childElem);
    }
  }
}

function updateSummaryException(e : TypeError){
  let summaryElem : HTMLDivElement = <HTMLDivElement>document.getElementById("summary");
  let date = new Date();
  summaryElem.innerHTML = date.toISOString() + ' ' + e;
}

function updateSummary(i : number){
  let summaryElem : HTMLDivElement = <HTMLDivElement>document.getElementById("summary");
  let date = new Date();
  summaryElem.innerHTML = date.toISOString() + ' ' + i.toString() + ' Agents Connected';
}

function main() {
  let listButtonElem : HTMLButtonElement = <HTMLButtonElement>document.getElementById("list");
  let watchButtonElem : HTMLButtonElement = <HTMLButtonElement>document.getElementById("watch");
  listButtonElem.onclick = onListClick;
  watchButtonElem.onclick = onWatchClick;
}

window.onload = main;
