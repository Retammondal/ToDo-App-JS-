// ==========================================
// 1. INITIAL DATA STATE
// ==========================================

// Date.now() gives each todo a Unique id (+1,+2,...b/c they are created in the same ms)
let defaultTodos = [
    {
        id: Date.now() + 1,
        text: "Go to Gym",
        isCompleted: false
    },
    {
        id: Date.now() + 2,
        text: "Revision Python",
        isCompleted: false
    },
    {
        id: Date.now() + 3,
        text: "Complete Today's Lecture",
        isCompleted: true
    },
    {
        id: Date.now() + 4,
        text: "Python Projects",
        isCompleted: true
    }
];

function loadTodos(){
    try{
        const saved = localStorage.getItem("todos");
        return saved != null ? JSON.parse(saved) : defaultTodos;
    } catch{
        return defaultTodos;
    }
}
let todos = loadTodos();

function saveTodos(){
    localStorage.setItem("todos", JSON.stringify(todos));
    taskCompleted();                      
}


let editTodoID = null;
// null --> form is in ADD Mode
// <id> --> form is in UPDATE mode (we are editing the todo with this id)

// ==========================================
// 2. DOM SELECTORS
// ==========================================
const todoForm = document.querySelector("#todo-form");     // Form element handling submission
const formBtn = document.querySelector("#form-btn")
const todoInput = document.querySelector("#todo-input");   // Input field for new task text
const todoList = document.querySelector("#todo-list");     // Parent <ul> container for rendered items


// ==========================================
// 3. RENDER FUNCTIONS
// ==========================================

// Function to print all pre-existing todos list first
function renderTodo() {
    todos.forEach((todo) => addTodo(todo));
}

renderTodo();                                                              // Initial render call on page load (runs once at start)


// Function to create DOM elements and inject content into list <li>
function addTodo(x) {
    const li = document.createElement("li");   

    // Store ID directly on <li> for easy access during event delegation
    li.dataset.id = x.id;
    li.className = "group flex items-center gap-3 border border-slate-200/90 p-3.5 rounded-xl bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-150 cursor-pointer select-none";
    
    // Step : Inject inner layout with data attributes for tracking
    li.innerHTML = `
        <input data-id="${x.id}" type="checkbox" ${x.isCompleted ? "checked" : ""}>
        <p class="flex-1 text-sm font-medium text-slate-700 transition-colors duration-150"></p>
        <div class="flex gap-1.5 items-center">
            <button data-action="edit" data-id="${x.id}"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer">
                Edit
            </button>
            <button data-action="delete" data-id="${x.id}"
                class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer">
                Delete
            </button>
        </div>
    `;

    const p = li.querySelector("p")
    p.textContent = x.text
    p.classList.toggle("line-through", x.isCompleted)           // true adds the class, false removes it
    p.classList.toggle("text-red-500", x.isCompleted)           

    todoList.append(li);                                   // Step : Append list item to parent -> ul.append(li)
}


// ==========================================
// 4. FORM SUBMIT (ADD or UPDATE)
// ==========================================
todoForm.addEventListener("submit", (e) => {
    e.preventDefault();                                    // Stop default form reload

    const todoValue = todoInput.value.trim();
    if (!todoValue) return;                                 // ignore empty todos

    // ---- ADD Mode ----
    if (editTodoID === null){
        const newTodo = {
            id : Date.now(),
            text : todoValue,
            isCompleted : false
        }
        // Update State
        todos.push(newTodo)
        // Update UI
        addTodo(newTodo)
        // Browser Storage
        saveTodos()
    } else{
        // ---- UPDATE Mode ----
        todos = todos.map((todo)=>{                         // Replace only matching todo -- Update State
            return todo.id === editTodoID ? {...todo, text: todoValue} : todo
        })
        // Update UI
        todoList.querySelector(`li[data-id="${editTodoID}"] p`).textContent = todoValue;
        // Browser Storage
        saveTodos();
    }

    resetForm();                    // Reset Form
});

// Put the form back in Normal ADD state
function resetForm(){
    todoInput.value = "";
    formBtn.textContent = "Add";
    editTodoID = null;
}

// ==========================================
// 5. EVENT DELEGATION & ACTION HANDLING
// ==========================================

// Core Concepts:
// - target -> Where I am clicking (exact inner child)
// - currentTarget -> Where event listener is attached (todoList container)

// Event Delegation  --> Works for todos added later too, b/c the listener is on the parent <ul>

todoList.addEventListener("click", (e) => {
    e.stopPropagation();

    let li = e.target.closest("li");                       // Grab closest parent <li>
    let id = Number(li?.dataset?.id);                      // Extract stored data-id from <li> ; strings --> Number conversion

    if (!li) return;                            

    let btn = e.target.closest("button");                  // Grab nearest button clicked
    let action = btn?.dataset.action;                      // Read action type: "edit" or "delete"

    // ---- EDIT ----
    if (action === "edit") {
        let currentTodo = todos.find((todo)=>{
            if (todo.id === id){
                return todo;
            }
        })
        // console.log(currentTodo.text);               // Give the actual text of that todo
        todoInput.value = currentTodo.text              // assigning text to input
        todoInput.focus();                              // will go to Input cursor
        
        formBtn.textContent = "Update"
        editTodoID = id;
        return        
    }

    // ---- DELETE ----
    if (action === "delete") {
        if (editTodoID === id) resetForm();                 // if click edit and delete same time
        deleteTodo(e, id);
        return;
    }

    // ---- ROW CLICK: toggle completion ----
    const checkbox = li.querySelector('input[type="checkbox"]');                // Selecting the Checkbox (inside List)
    if (!checkbox) return;                                                      // If the checkbox does NOT exist...return

    if (e.target !== checkbox){             // If target is not checkbox wwe have to flip...otherwise it will flip Normal behaviour
        checkbox.checked = !checkbox.checked
    }

    // Update State
    todos = todos.map((todo)=>{
        return (todo.id === Number(id)) ? {...todo, isCompleted: checkbox.checked} : todo;     // checkbox.checked --> true/false
    })

    // Update UI
    li.querySelector("p").classList.toggle("line-through",checkbox.checked)
    li.querySelector("p").classList.toggle("text-red-500",checkbox.checked)

    // Browser Storage
    saveTodos();
});


// ==========================================
// 6. DELETE & EDIT HANDLERS
// ==========================================

function deleteTodo(e, id) {
    e.target.closest("li").remove();                       // 1. Remove element from DOM immediately

    // 2. Remove element from state array
    // Note: dataset IDs are strings, so cast to Number() for strict comparison
    todos = todos.filter((todo) => {
        if (todo.id !== id) {
            return todo;
        }
    });
    saveTodos();
}



// How Edit will be done??
// When we will click on Edit all content of li will go to input form and add button will change to update


// To Show How much task is Complete and How much not...
function taskCompleted(){
    const taskOpen = document.querySelector("#task-open")
    const taskCompleted = document.querySelector("#task-completed")
    
    taskOpen.textContent = todos.reduce((acc,value)=>{
        return !(value.isCompleted) ? acc+=1 : acc
    },0)
    taskCompleted.textContent = todos.reduce((acc,value)=>{
        return (value.isCompleted) ? acc+=1 : acc
    },0)
}
taskCompleted();            // Initial Render