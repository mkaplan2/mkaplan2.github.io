const listsContainer = document.querySelector('[data-lists]') 
/* contains the items in an unordered list,
like youtube, grocery, etc.. (so the major big tasks) */

/* Used to make a new list when someone types something into the form*/
const newListForm = document.querySelector('[data-new-list-form]')

/* ME: Something is wrong- this is NOT updating when put in a new input!!!!*/
const newListInput = document.querySelector('[data-new-list-input]') /* used to get the input that was inputted/typed into the form */

const deleteListButton = document.querySelector('[data-delete-list-button]')

/* Render function effects the below variables : */
const listDisplayContainer = document.querySelector('[data-list-display-container]')
const listTitleElement = document.querySelector('[data-list-title]')
const listCountElement = document.querySelector('[data-list-count]')

const tasksContainer = document.querySelector('[data-tasks]')
const taskTemplate = document.getElementById('task-template')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')

/* When you use local storage, need keys 
(bc localStorage stores key-value pairs.
    Using the name "task.lists" for some reason prevents collisions,
    though i am not exactly sure why-- can look up later!*/
const LOCAL_STORAGE_LIST_KEY = 'task.lists' //At 11:46 has an explaination- there are also some articles on this-maybe read later?
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId' //just need to make sure that this is different then the other key we called "tasks.list"

/* The "lists" variable will be a container that holds all our lists
(aka the youtube task list, the work task list, the grocery task list, etc...) */
/* Need a way to represent which list is selected (the "active-list"),
and to do this need to have each list have characteristics, which you can
only have with objects, so need the "lists" variable be a list of OBJECTS */
/* Each object in the lists container has an id and name */

/* If we were not updating it,
would manually look like:

let lists = [{
    id: 1,
    name: 'Grocery'
}, {
    id: 2,
    name: 'Work' //so need to make the innertext of the li element be the "name" property of the object
}] 

*/

/* If we have made a lists variable before, then 
we will have something in our local storage already that has
a key with the value of the LOCAL_STORAGE_LIST_KEY and
want to use it (so that we can continue from wut we 
    were doing before/have a list that we can save in
    local storage an continue working with), but if we 
have not made a list before, then should just make an empty array */
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)

/* This function will reassign the selectedListId variable to
whatever li element was just selected, like "Work", "Grocery", etc */
listsContainer.addEventListener('click',e => {
    /* only want this to happen if we clicked 
    an li element (Grocery, Work, etc) */

    if (e.target.tagName.toLowerCase() == 'li'){
        /* "e.target" is the thing that we selected */

        selectedListId = e.target.dataset.listId 
        /* want to get the "dataset.listId" property that 
        we set as "list.Id" for the li element that we clicked, 
        that was initialised below */

        /* Need to save an render after reseting the "selectedListId" variable
        so that will rememeber that the value of the variable was changed */
        saveAndRender()
    }
})

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input'){
        const selectedList = lists.find(list => list.id === selectedListId)
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
        selectedTask.complete = e.target.checked
        save()
        renderTaskCount(selectedList)
    }
})

clearCompleteTasksButton.addEventListener('click', e =>{
    const selectedList = lists.find(list => list.id === selectedListId)
    /* setting the task list to all the tasks that are NOT complete */
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
    saveAndRender()
})

/* Allows us to use the button to delete the list that is currently selected */
deleteListButton.addEventListener( 'click', e =>{
    /* The filter() method creates a new array with 
    all elements that pass the test implemented by the provided function.
    
    So basically the line below will reassign the lists variable to include
    everything BUT the selected list (so removed the selected list)*/
    lists = lists.filter(list => list.id !== selectedListId)

    /* Now the selected list is deleted, so the selectedListId should be null,
    as the list it was assigned to mark before is gone */
    selectedListId = null

    saveAndRender() 
    /* save all the updated values for the variables to localStorage,
    and then rerenders the entire page */
})

/* Need an event listener so that can make a new form */
newListForm.addEventListener('submit', e => {
    e.preventDefault() /* this prevents the pages from refreshing when press enter/submit */
    
    /* Problem from before: was using ".nodeValue" instead of "value" */
    const listName = newListInput.value //so the listName will be like "Work" or "Grocery", unless didn't type in anything
    
    //if didn't type in anything, just return
    if(listName == null || listName == ''){
        return
    }

    const list = createList(listName) //function we made (below): creates a list for the listName we typed in
    
    /* need to clear the input that we put into the form 
    (so can write other things, and wut we wrote will not just stay there forever), 
    which we can do simply
    by just setting the "value" of the input to "null" */
    newListInput.value = null

    lists.push(list) 
    /* adding this list that we just created 
    (that currently has an empty array of tasks)
    to the master list we initialized as "lists" at the top of the program */
    saveAndRender()
})

newTaskForm.addEventListener('submit', e => {
    e.preventDefault()
    const taskName = newTaskInput.value
    if(taskName == null || taskName == ''){
        return
    }
    const task = createTask(taskName)
    newTaskInput.value = null
    const selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks.push(task)
    saveAndRender()
})

/* Returns an object with an id, name, and empty list of task. 
"name" in the parameter: Will be like "Grocery", "Work", etc...
So basically making an object for "Grocery"/"Work"/etc. 
that has its own array of tasks 
(so the list has its own array of things, 
    each of which is an individual task)
*/
function createList(name){
    /* To create a unique id for each list, 
    use the date that it was created, and convert it to a string */
    return { id : Date.now().toString(), name: name, tasks: [] }
    /* returns an object that has an id, name, and empty list of task */

    /* the tasks array is an array of objects that have an id, name, and boolean completed field.
    So if we manually wrote it would look like:
    tasks: [{
        id: 1,
        name: '30 minutes of writing',
        completed: false
    }]
    */
}

function createTask(name){
    return { id : Date.now().toString(), name: name, complete: false }
}

/* Allows us to save the lists we have made */
function save(){
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))

    /* Need to also make sure to save the selectedListId because if you 
    click a different list, the active list/list with the the value of the
    selectedListId will change, but hte program will only remember this if
    you put it in local storage */
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId)
}

function render(){
    
    clearElement(listsContainer) /* clears everything/all the elemnents in the list, so nothing is there*/
    
    /* after clears everything THEN rerenders */
    
    /* It is good to clear everything first before rendering - look at
    17:48 in the video to see why */
    renderLists()
    
    const selectedList = lists.find(list => list.id === selectedListId)
    
    /* Want to first see if we have a selected list */
    if(selectedListId == 'null' || selectedListId == null){
        /* okay so this was causing a 
        problem before because for some reason is 
        intialized as 'null', NOT null --- LOL,
        so was not entering the if statement
        because had "if (selectedListId == null)"
        instead of : "if (selectedListId == 'null')" */

        /* if do not have a list selected,
        the do not want to display the big box of tasks */
        
        /* this makes sure that no list appears if there is
        no list available to display -- so gets rid
        of the box to the side that displays the task COMPLETELY 
        (because there is not thing to display DUH) */
        listDisplayContainer.style.display = 'none' 
        /* because set it to none, 
        means that this element will not be displayed */
    } else {
        /* if the selected list is NOT null */
        listDisplayContainer.style.display = '' /* setting the display to an empty string, which will make it just display normally */
        listTitleElement.innerText = selectedList.name //using the variable we initialed right closely above
        renderTaskCount(selectedList)
        clearElement(tasksContainer)
        renderTasks(selectedList)
    }
}

function saveAndRender(){
    save()
    render()
}

function renderTasks(selectedList){
    selectedList.tasks.forEach(task => {
        /* so everything below will 
        run for every single task we have/ "forEach" task we have -- DUH! */
        
        /* Using the template tag stuff from the HTML --28:16 */
        const taskElement = document.importNode(taskTemplate.content, true)
        
        /* OMGGG i was having a problem before because
        i wrote "checkBox" instead of "checkbox" */
        const checkbox = taskElement.querySelector('input') /* !! Figure out how this part of the code works- because there are a number f things with "input" -- how does it know what we are talking about ?? */
        checkbox.id = task.id /* !!!Watch video: what exactly is happening here?? */

        /* lol before was having a problem because wrote: "checked.checked =" 
        instead of "checkbox.checked =" --LOL */
        checkbox.checked = task.complete
        const label = taskElement.querySelector('label')
        label.htmlFor = task.id
        label.append(task.name)
        tasksContainer.appendChild(taskElement)
    })
}

function renderTaskCount(selectedList){
    /* want to show the num of INCOMPLETE tasks */
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length
    
    /* ternary operator - makes if statement shorter like i already know! */
    const taskString = incompleteTaskCount === 1 ? "task" : "tasks"
    
    /* IMPORTANT I DIDN'T REALISE THIS: 
    Using a backtick here, NOT a single quote!!! */
    /* String interpollation - basically using code to write 
    out a string/text that will be displayed: ex: "0 tasks reminaing"*/
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`

}

/* Used in the render function.
Used to make each li element in the unordered list */
function renderLists(){
    lists.forEach(list =>{
        /* goes through each "list" in the "lists" array 
        initialized at the beginning 
        of the program */
        /* what we are trying to make:
        <li class="list-name">Work<li>
        */
        const listElement = document.createElement('li')
        listElement.dataset.listId = list.id /* making the dataset/"data-___" propoert be the id of the object * in the lists arrray */

        /* this is an "add" function bc the default for this li would be just to not have a class, so we are ADDING a class here...DUH!*/
        listElement.classList.add('list-name') //we want all the of the li's to have same class: list-name
        listElement.innerText = list.name //making the inner text be "Work" or something similar
        
        /* making the list we select be the "active-list", 
        and change its class to "active-list" */
        if(list.id === selectedListId){
            listElement.classList.add('active-list')
        }
        listsContainer.appendChild(listElement)
    })
}

/* will clear all the elements in the list, so start with an empty list.
Will clear the "Youtube", "Work", "Grocery", and etc lists everytime we call render */
function clearElement(element){
    /* this while loop will remove all the children of the element until there is nothing there - so basically clears the list */
    while(element.firstChild){
        /* if the element has a first child */
        element.removeChild(element.firstChild)
    }
}

render()  /* could this be the problem? i am only calling the render function?? */