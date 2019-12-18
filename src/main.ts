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
  let base = '/agent/';
  let api = getApi();
  let url = api + base + agent.id + '/';

  let agentElem = document.createElement('div');
  let leftSideElem = document.createElement('div');
  let rightSideElem = document.createElement('div');
  let topbarElem = document.createElement('div');
  let userElem = document.createElement('a');
  let pathElem = document.createElement('a');
  let dollarElem = document.createElement('a');
  let userSpanElem = document.createElement('span');
  let pathSpanElem = document.createElement('span');
  let dollarSpanElem = document.createElement('span');
  let subbarElem = document.createElement('div');
  let connectElem = document.createElement('a');

  userElem.innerHTML = agent.whoami + '@' + agent.hostname + ' ';
  pathElem.innerHTML = agent.pwd;
  // pathElem.setAttribute('target', '_blank');
  pathElem.setAttribute('href', '#');
  dollarElem.innerHTML = ' $';
  userSpanElem.appendChild(userElem);
  pathSpanElem.appendChild(pathElem);
  dollarSpanElem.appendChild(dollarElem);

  connectElem.innerHTML = 'connect';
  connectElem.setAttribute('target', '_blank');
  connectElem.setAttribute('href', url);

  topbarElem.setAttribute('class', 'agent-topbar');
  topbarElem.appendChild(userSpanElem);
  topbarElem.appendChild(pathSpanElem);
  topbarElem.appendChild(dollarSpanElem);

  subbarElem.setAttribute('class', 'agent-subbar');
  subbarElem.innerHTML = "connected *** ago | ";
  subbarElem.appendChild(connectElem);

  leftSideElem.setAttribute('class', 'agent-left');
  leftSideElem.innerHTML = 'L';

  rightSideElem.setAttribute('class', 'agent-right');
  rightSideElem.appendChild(topbarElem);
  rightSideElem.appendChild(subbarElem);

  agentElem.setAttribute("class", "agent");
  agentElem.setAttribute("id", agent.id);
  // agentElem.appendChild(document.createElement('hr'));
  agentElem.appendChild(leftSideElem);
  agentElem.appendChild(rightSideElem);
  // agentElem.appendChild(document.createElement('hr'));

  return agentElem;
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
