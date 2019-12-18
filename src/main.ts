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
    // console.log(intervalIDs.length, watchExceptions.length);
    agents = await apiAgents();
  } catch (e) {
    if (intervalIDs.length > 0) {
      watchExceptions.push(e);
    }
    pushSummary(newSummaryException(e));
    return;
  } finally {
    if ((intervalIDs.length > 0) && (watchExceptions.length > 1)) {
      cancelWatch();
    }
  }
  updateAgents(agents);
  pushSummary(newSummaryMessage(agents.length));
}

function createAgent(agent : any) : Agent{
  let agentJSON = {
    id: agent.id,
    ip: agent.ip,
    os: agent.os,
    pwd: agent.pwd,
    arch: agent.arch,
    whoami: agent.whoami,
    hostname: agent.hostname,
    connected: agent.connected
  };
  return agentJSON;
}

interface Agent {
  id : string;
  ip : string;
  os : string;
  pwd : string;
  arch : string;
  whoami : string;
  hostname : string;
  connected: number;
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
  let sepElem = document.createElement('a')
  let ipElem = document.createElement('a');

  userElem.innerHTML = agent.whoami + '@' + agent.hostname + ' ';
  pathElem.innerHTML = agent.pwd;
  // pathElem.setAttribute('target', '_blank');
  pathElem.setAttribute('href', '#');
  dollarElem.innerHTML = ' $';
  userSpanElem.appendChild(userElem);
  pathSpanElem.appendChild(pathElem);
  dollarSpanElem.appendChild(dollarElem);

  ipElem.innerHTML = agent.ip;
  ipElem.setAttribute('target', '_blank');
  ipElem.setAttribute('href', 'https://ip.sb/ip/'+agent.ip);
  sepElem.innerHTML = ' | ';
  connectElem.innerHTML = 'connect';
  connectElem.setAttribute('target', '_blank');
  connectElem.setAttribute('href', url);

  topbarElem.setAttribute('class', 'agent-topbar');
  topbarElem.appendChild(userSpanElem);
  topbarElem.appendChild(pathSpanElem);
  topbarElem.appendChild(dollarSpanElem);

  subbarElem.setAttribute('class', 'agent-subbar');
  subbarElem.innerHTML = "connected " + ago(agent.connected) + " ago | " + agent.id + " | ";
  subbarElem.appendChild(ipElem);
  subbarElem.appendChild(sepElem);
  subbarElem.appendChild(connectElem);

  leftSideElem.setAttribute('class', 'agent-left');
  leftSideElem.innerHTML = 'L';

  rightSideElem.setAttribute('class', 'agent-right');
  rightSideElem.appendChild(topbarElem);
  rightSideElem.appendChild(subbarElem);

  agentElem.setAttribute("class", "agent");
  agentElem.setAttribute("id", agent.id);
  agentElem.appendChild(leftSideElem);
  agentElem.appendChild(rightSideElem);

  return agentElem;
}

function ago(s : number) : string {
  let min = Math.round((Date.now()/1000-s)/60)
  if (min < 60) {
    return min.toString() + " min"
  }
  if (60 <= min && min < 60*24) {
    return Math.round(min/60).toString() + " hour"
  }
  return Math.round(min/60/24).toString() + " day"
}

// TODO: agents container object .update(agents)
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

  for (let agent of agents) {
    if (!existingAgentIDs.has(agent.id)) {
      let childElem : HTMLDivElement = createAgentElem(agent);
      agentsContainerElem.appendChild(childElem);
      existingAgentIDs.add(agent.id);
    }
  }

  for (let child of agentsContainerElem.childNodes) {
    if (!newAgentIDs.has((<HTMLDivElement>child).id)) {
      agentsContainerElem.removeChild(child);
    }
  }
}

function newSummaryException(e : TypeError) : HTMLDivElement {
  let itemElem = document.createElement('div');
  let date = new Date();
  itemElem.innerHTML = date.toISOString() + ' ' + e;
  return itemElem;
}

function newSummaryMessage(i : number) : HTMLDivElement {
  let itemElem = document.createElement('div');
  let date = new Date();
  itemElem.innerHTML = date.toISOString() + ' ' + i.toString() + ' Agents Connected';
  return itemElem;
}

// TODO: push to sized queue object
function pushSummary(child : HTMLDivElement){
  let summaryElem : HTMLDivElement = <HTMLDivElement>document.getElementById("summary");
  while (summaryElem.childNodes.length >= 3){
    summaryElem.removeChild(summaryElem.lastChild);
  }
  summaryElem.prepend(child);
}

function main() {
  let listButtonElem : HTMLButtonElement = <HTMLButtonElement>document.getElementById("list");
  let watchButtonElem : HTMLButtonElement = <HTMLButtonElement>document.getElementById("watch");
  listButtonElem.onclick = onListClick;
  watchButtonElem.onclick = onWatchClick;
}

window.onload = main;
