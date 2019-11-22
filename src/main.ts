function onClick(){
  let inputElem : HTMLInputElement = <HTMLInputElement>document.getElementById("api");
  let api : string = inputElem.value;
  console.log(inputElem);
  console.log(api);
}

function main() {
  let buttonElem : HTMLButtonElement = <HTMLButtonElement>document.getElementById("connect");
  buttonElem.onclick = onClick;
}

window.onload = main;
