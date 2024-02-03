//Global Constants And Variables
const form = document.querySelector('form.add-remove');
const container = document.querySelector('.container');
const todoInputField = document.querySelector('input[type="text"]');
const overlay = document.querySelector('.overlay');
const dialogForm = document.querySelector('form.yes-no');
const dialog = document.querySelector('.dialog');
let todoList = [];
let localStorageArray = [];

//Checking Local Storage
const storedArray = localStorage.getItem("localStorageArray");
if (storedArray) {
    todoList = JSON.parse(storedArray);
    todoList.forEach((todo) => {
        const newtodoElement = createTodo(container, todo.toDo,todo.id);
        if (todo.done) {
            newtodoElement.classList.toggle("done-task"); 
        }
    });
}

//Adding Todos
form.addEventListener("submit", todoCreation);
function todoCreation(event) {
    event.preventDefault();
    const toDo = todoInputField.value.trim();
    if (toDo) {
        const id = Date.now();
        const task = {id,toDo,done:false};
        todoList.push(task);
        updateLocalStorage();
        createTodo(container,task.toDo,task.id);
        todoInputField.value = ''; 
    }
}
function createTodo(parent, toDo , id) {
    const li = document.createElement('li');
    const h4 = document.createElement('h4');
    h4.innerText = toDo;
    h4.classList.add("box-1-heading","fz-14");
    li.append(h4);
    const div = document.createElement('div');
    div.classList.add("icons","flx-ic");
    const doneIcone = document.createElement('i');
    doneIcone.classList.add("fa-solid","fa-check","done","c-g","main-tr");
    const deleteIcone = document.createElement('i');
    deleteIcone.classList.add("fa-regular","fa-trash-can","delete","c-r","main-tr");
    div.append(doneIcone,deleteIcone);
    li.append(div)
    li.classList.add("box", "flx-sb-c", "pd-block-8", "border-eee-bt");
    li.setAttribute("id",id)
    parent.prepend(li);
    return li;
}

//Checking And Deletion
container.addEventListener("click", handleContainerClick);
function handleContainerClick(event) {
  const target = event.target;
  if (target.classList.contains('delete')) {
    overlay.style.display = 'block';
    dialogForm.addEventListener("submit",(event)=>{handleDialogYes(event,deleteToDo,target.closest('li'))});
    dialogForm.addEventListener("reset", handleDialogNo);
  } else if (target.classList.contains('done')) {
    checkTodo(target.closest('li'));
  }
}
//Deletion & Local Storage Update
function deleteToDo(todoToDelete) {
    container.removeChild(todoToDelete); 
    todoList = todoList.filter((element)=>{return element.id != todoToDelete.id})
    updateLocalStorage();
}
//Checking & Local Storage Update
function checkTodo(todoToCheck) {
    todoToCheck.classList.toggle("done-task");
    for(todo of todoList){
        if(todo.id == todoToCheck.id){
            todo.done = !todo.done;
        }
    }
    updateLocalStorage();
}
//Handling Clearing All Notes
form.addEventListener("reset", handleDeleteAll);
function handleDeleteAll(event) {
    event.preventDefault();
    if (container.children.length) {
        overlay.style.display = 'block';       
        dialogForm.addEventListener("submit",(event)=>{handleDialogYes(event,clearAll,container)});
        dialogForm.addEventListener("reset", handleDialogNo);
    }
}
//Handling Yes Choice
function handleDialogYes(event,func,argument) {
    event.preventDefault();
    overlay.style.display = 'none';
    func(argument);
}
//Handling No Choice
function handleDialogNo(event) {
    event.preventDefault();
    overlay.style.display = 'none';
}
//Performing CleanUp & Updating Local Storage
function clearAll(parent) {
    parent.innerHTML = ''; 
    localStorage.removeItem("localStorageArray");
}
//Dialog Display Handle
overlay.addEventListener("click",(event)=>{if(!event.target.closest('.dialog')){overlay.style.display='none'}})
//Local Storage Update Handle
function updateLocalStorage(){
    localStorageArray = JSON.stringify(todoList);
    localStorage.setItem("localStorageArray",localStorageArray);
}