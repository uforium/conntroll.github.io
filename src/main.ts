var defaultAPIHost = "hub.k0s.io";
var defaultAPI = "https://"+defaultAPIHost;
var isExtension : boolean = ((<any>window).chrome && (<any>window).chrome.runtime && (<any>window).chrome.runtime.id);
var isGitHubPage : boolean = (window.location.host == "conntroll.github.io");
var isK0sio : boolean = (window.location.host.endsWith("k0s.io"));
var shouldUseDefaultAPI : boolean = isExtension || isGitHubPage || isK0sio;


function autoAPIURL() {
  let inputElem : HTMLInputElement = <HTMLInputElement>document.getElementById("api");
  if (shouldUseDefaultAPI) {
    inputElem.value = defaultAPI;
    return;
  }
  inputElem.value = window.location.origin;
}

function getAPIURL() : URL {
  let inputElem : HTMLInputElement = <HTMLInputElement>document.getElementById("api");
  let api : string = inputElem.value;
  let url : URL;
  try {
    url = new URL(api);
  } catch (e) {
    pushSummary(newSummaryException(e));
  }
  return url;
}

function createAgent(agent : any) : Agent{
  let agentJSON : Agent = {
    id: agent.id,
    name: agent.name,
    ip: agent.ip,
    os: agent.os,
    pwd: agent.pwd,
    arch: agent.arch,
    auth: agent.auth,
    tags: agent.tags,
    username: agent.username,
    hostname: agent.hostname,
    connected: agent.connected,
  };
  if (agent.distro) {
    agentJSON.distro = agent.distro;
  }
  return agentJSON;
}

interface Agent {
  id : string;
  name : string;
  distro?: string;
  ip : string;
  os : string;
  pwd : string;
  arch : string;
  auth : boolean;
  tags : string[];
  username : string;
  hostname : string;
  connected: number;
}

function createAgentElem(agent : Agent) : HTMLDivElement {
  let base = '/api/agent/';
  let au = getAPIURL();
  let url : string = au.protocol + "//" + au.host + base + agent.id;

  if (au.username != "" && au.password != "") {
    url = au.protocol + "//" + au.username + ":" + au.password + "@" + au.host + base + agent.id;
  }

  let agentElem = document.createElement('div');
  let leftSideElem = document.createElement('div');
  let rightSideElem = document.createElement('div');
  let topbarElem = document.createElement('div');
  let midbarElem = document.createElement('div');
  let userElem = document.createElement('a');
  let pathElem = document.createElement('a');
  let dollarElem = document.createElement('a');
  let userSpanElem = document.createElement('span');
  let pathSpanElem = document.createElement('span');
  let tagsSpanElem = document.createElement('span');
  let dollarSpanElem = document.createElement('span');
  let subbarElem = document.createElement('div');
  let connectElem = document.createElement('a');
  let sepElem = document.createElement('a')
  let ipElem = document.createElement('a');

  userElem.innerHTML = agent.username + '@' + agent.hostname + ' ';
  pathElem.innerHTML = ' ' + agent.pwd;
  pathElem.setAttribute('target', '_blank');
  pathElem.setAttribute('href', url+'/rootfs'+agent.pwd);
  dollarElem.innerHTML = ' ~ ';
  dollarElem.setAttribute('target', '_blank');
  dollarElem.setAttribute('href', url+'/rootfs/home/'+agent.username);
  userSpanElem.appendChild(userElem);
  pathSpanElem.appendChild(pathElem);

  for (let tag of agent.tags) {
    let tagElem = document.createElement('a');
    tagElem.innerHTML = tag;
    tagElem.setAttribute('class', 'tag');
    tagsSpanElem.appendChild(tagElem);
  }

  dollarSpanElem.appendChild(dollarElem);

  ipElem.innerHTML = agent.ip;
  ipElem.setAttribute('target', '_blank');
  // ipElem.setAttribute('href', 'https://ip.sb/ip/'+agent.ip);
  ipElem.setAttribute('href', 'https://www.wolframalpha.com/input/?i='+agent.ip+' ip geolocation');
  sepElem.innerHTML = ' | ';
  connectElem.innerHTML = 'connect';
  connectElem.setAttribute('target', '_blank');
  connectElem.setAttribute('href', url + "/");

  topbarElem.setAttribute('class', 'agent-topbar');
  topbarElem.appendChild(userSpanElem);
  topbarElem.appendChild(tagsSpanElem);

  midbarElem.setAttribute('class', 'agent-midbar');
  midbarElem.appendChild(pathSpanElem);
  midbarElem.appendChild(dollarSpanElem);

  subbarElem.setAttribute('class', 'agent-subbar');
  subbarElem.innerHTML = "connected " + ago(agent.connected) + " ago | " + agent.name + " | ";
  subbarElem.appendChild(ipElem);
  subbarElem.appendChild(sepElem);
  subbarElem.appendChild(connectElem);

  leftSideElem.setAttribute('class', 'agent-left');
  if (agent.auth) {
    leftSideElem.className += ' auth';
  } else {
    leftSideElem.className += ' noauth';
  }
  leftSideElem.innerHTML = '*';
  if (agent.distro) {
    let dist = agent.distro
    let Dt = dist.slice(0,1).toUpperCase()+dist.slice(1,2);
    leftSideElem.innerHTML = Dt;
  }

  rightSideElem.setAttribute('class', 'agent-right');
  rightSideElem.appendChild(topbarElem);
  rightSideElem.appendChild(midbarElem);
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
      // agentsContainerElem.appendChild(childElem);
      agentsContainerElem.insertBefore(childElem, agentsContainerElem.firstChild);
      existingAgentIDs.add(agent.id);
    }
  }

  for (let child of agentsContainerElem.childNodes) {
    if (!newAgentIDs.has((<HTMLDivElement>child).id)) {
      agentsContainerElem.removeChild(child);
    }
  }
  updateCount++;
}

// when updateCount > 3, we assume the output is stable
// it's time to watch updates
var updateCount : number = 0;

function newSummaryCloseEvent(e : CloseEvent) : HTMLDivElement {
  let itemElem = document.createElement('div');
  let date = new Date();
  itemElem.innerHTML = date.toISOString() + ' WebSocket Connection Closed';
  return itemElem;
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

function newSummaryWsConnectedMessage() : HTMLDivElement {
  let itemElem = document.createElement('div');
  let date = new Date();
  itemElem.innerHTML = date.toISOString() + ' Start Watching Agents';
  return itemElem;
}

function pushSummary(child : HTMLDivElement){
  let summaryElem : HTMLDivElement = <HTMLDivElement>document.getElementById("stats");
  while (summaryElem.childNodes.length >= 3){
    summaryElem.removeChild(summaryElem.lastChild);
  }
  summaryElem.prepend(child);
}

function agentsWatch(){
  let wsScheme : string = ((window.location.protocol == "https:") || shouldUseDefaultAPI ? 'wss://' : 'ws://')
  let wsHost : string = (shouldUseDefaultAPI ? defaultAPIHost : window.location.host)
  const url = wsScheme + wsHost + '/api/agents/watch';

  var ws = new WebSocket(url);
  ws.binaryType = 'blob';
  ws.onopen = (event:Event) => {
    pushSummary(newSummaryWsConnectedMessage());
  }
  ws.onclose = (event:CloseEvent) => {
    pushSummary(newSummaryCloseEvent(event));
    // reconnect
    setTimeout(function() { agentsWatch() }, 5);
  }
  ws.addEventListener('message', function (event:MessageEvent) {
    let agents : Agent[] = JSON.parse(event.data);
    updateAgents(agents);
    pushSummary(newSummaryMessage(agents.length));
  });
}

function saveAgents(val: string){
  let key : string = "agents";
  window.localStorage.setItem(key, val);
}

function loadAgents(){
  var key : string = "agents";
  var val : string = window.localStorage.getItem(key);
  if (val.length == 0) {
    return
  }
  let agents : Agent[] = JSON.parse(val);
  updateAgents(agents);
}

function observeAgents(){
  var target = document.getElementById("agents");

  // Create an observer instance
  var observer = new MutationObserver(function( mutations ) {
    mutations.forEach(function( mutation ) {
      var newNodes = mutation.addedNodes;
      var removedNodes = mutation.removedNodes;
      if (Notification.permission == "granted" && (updateCount > 3)) {
	if( newNodes.length != 0) {
	  var notification = new Notification("added" + (new Date()));
	  console.log(newNodes, notification);
	}
	if( removedNodes.length != 0 ) {
	  var notification = new Notification("removed" + (new Date()));
	  console.log(removedNodes, notification);
	}
      }
    });
  });

  // Configuration of the observer:
  var config = {
    attributes: true,
    childList: true,
    characterData: true
  };

  // Pass in the target node, as well as the observer options
  observer.observe(target, config);

  // Later, you can stop observing
  // observer.disconnect();
}

function main() {
  autoAPIURL();
  agentsWatch();
  observeAgents();
}

window.onload = main;
