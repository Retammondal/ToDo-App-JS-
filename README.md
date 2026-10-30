# Todo List App

A simple todo list I built with plain JavaScript and Tailwind CSS (no frameworks). I made it to practice DOM manipulation, and it ended up teaching me a lot more than I expected, mostly through the bugs.

## What it can do

- Add a new todo
- Edit a todo (the same form switches from "Add" to "Update")
- Delete a todo
- Mark a todo as done by clicking the checkbox, or by clicking anywhere on the row
- Completed todos get a line-through and turn red
- Shows how many tasks are open and how many are completed
- Everything is saved in the browser, so a refresh doesn't lose anything

## How I built it (and the logic behind it)

### 1. The `todos` array is the main data

Every todo is an object:

```js
{ id: 1730000000001, text: "Go to Gym", isCompleted: false }
```

I used `Date.now()` for the id so every todo gets a unique one. I didn't use `Math.random()` because random numbers can repeat. The first 4 todos use `Date.now() + 1`, `+ 2` and so on, because they get created in the same millisecond.

The big thing I learned here: **changing the array does not change the screen.** I have to update both, the data (state) and the page (UI). My line-through bug happened exactly because of this.

### 2. Showing the todos

`addTodo(x)` builds one `<li>` and puts it in the list. `renderTodo()` just loops over the array and calls `addTodo` for each todo once when the page loads.

I use `forEach` there and not `map`, because I'm only *doing* something for each item, not making a new array.

I set the text with `textContent` instead of putting it inside the `innerHTML` string. If I put user text in `innerHTML`, someone could type HTML or a script and it would actually run. `textContent` treats it as plain text only.

### 3. One click listener for the whole list (event delegation)

Instead of adding a listener on every button, I added **one** on the `<ul>`. It also works for todos added later, because the listener is on the parent.

Inside it:

- `e.target` is the exact thing I clicked
- `closest("li")` finds which todo it belongs to
- `closest("button")` checks if it was a button

Each button has `data-action="edit"` or `data-action="delete"`, and each `<li>` has `data-id`. I read them with `dataset`. Values from `dataset` are always strings, so I convert the id with `Number()`.

I also used `?.` (optional chaining) on `btn?.dataset.action`, because if I click somewhere that isn't a button, `btn` is `null` and it would crash.

### 4. Add vs Update mode

The same form does both jobs. I use a variable:

```js
let editTodoID = null;
```

- `null` means the form is in **Add** mode
- a number means I'm **editing** that todo

When I click Edit, the todo's text goes into the input, the button changes to "Update", and `editTodoID` stores the id. On submit I check `editTodoID === null` to decide whether to add or update. After either one, `resetForm()` puts everything back to Add mode.

I first checked the button's text (`"Add"` / `"Update"`) to decide the mode, but checking the variable is safer.

### 5. Updating state without changing the original

I didn't change objects directly. I used `map` with the spread operator to make a new array:

```js
todos = todos.map((todo) =>
    todo.id === id ? { ...todo, isCompleted: checkbox.checked } : todo
);
```

Delete uses `filter` to keep everything except the one with that id.

### 6. Toggling by clicking the row

If I click the checkbox itself, the browser already flips it. If I click somewhere else on the row, I have to flip it myself in code. Otherwise it toggles twice or not at all. So:

```js
if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
```

Then I save the checkbox's value into state, so the checkbox and the data can't go out of sync. Edit and Delete both `return` early, so clicking those buttons never toggles the todo.

### 7. Saving in localStorage

localStorage only stores strings, so:

- saving: `JSON.stringify(todos)`
- loading: `JSON.parse(...)`

`loadTodos()` runs once at the start. If nothing is saved yet it uses my 4 default todos, otherwise it uses what was saved. That means the 4 defaults only show up the first time, and after that I can edit or delete them like any other todo.

`saveTodos()` is called every time the data changes: add, update, toggle and delete. I don't save `editTodoID`, because that's only temporary form state.

### 8. Task counts

`taskCompleted()` counts open and completed todos and writes the numbers on the page. I call it at the start and after every change.

## Bugs I ran into

- Wrote `False` instead of `false` (Python habit). Adding a todo threw an error.
- Used `map` with curly braces but forgot `return`. Every todo became `undefined` and the list was wiped.
- Clicking empty space in the list crashed, because `li` was `null`. Fixed with `if (!li) return;`
- `classList.toggle("line-through text-red-500", ...)` fails, since toggle takes **one** class at a time. I call it twice.
- Deleting a todo while editing it left the form stuck in Update mode. Now it calls `resetForm()` first.
- `e.stopPropagation;` without `()` does nothing.

## Things I want to add next

- Filters (all / open / completed)
- A "clear completed" button
- Maybe move it to React later

## How to run it

Open `index.html` in the browser. To start fresh, run `localStorage.clear()` in the console and refresh.