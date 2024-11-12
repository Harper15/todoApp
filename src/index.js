import "./styles.css";

class todoModel {
  constructor(text) {
    this.text = text;
    this.completed = false;
  }
}

class todoListModel {
  constructor(controller) {
    this.controller = controller;
    this.todos = [];
  }

  addTodo(todo) {
    this.todos.push(todo);
  }

  getTodos() {
    return this.todos;
  }

  deleteTodo() {
    this.todos.pop();
  }

  updateTodoText(index, text) {
    this.todos[index].text = text;
  }

  updateTodoCompleted(index) {
    this.todos[index].completed = !this.todos[index].completed;
  }
}

class todoListView {
  constructor(controller) {
    this.controller = controller;
    this.todoList = document.querySelector("ul.todo-list");
    this.doneList = document.querySelector("ul.completed-list");
    this.addTodoButton = document.querySelector("p.add-todo");
    this.addTodoButton.addEventListener("click", () => {
      this.toggleAddTodoInput();
    });
  }

  toggleAddTodoInput() {
    this.addTodoButton.style.display = "none";
    const addTodoForm = document.createElement("input");
    addTodoForm.style.display = "block";
    addTodoForm.setAttribute("type", "text");
    addTodoForm.setAttribute("placeholder", "Add a todo");
    addTodoForm.className = "add-todo-input";
    addTodoForm.addEventListener("focusout", () => {
      addTodoForm.style.display = "none";
      this.addTodoButton.style.display = "block";
    });
    addTodoForm.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.controller.addTodo(addTodoForm.value);
        addTodoForm.style.display = "none";
        this.addTodoButton.style.display = "block";
      } else if (e.key === "Escape") {
        addTodoForm.style.display = "none";
        this.addTodoButton.style.display = "block";
      }
    });
    this.todoList.appendChild(addTodoForm);
    addTodoForm.focus();
  }

  editTodoText(index) {}

  toggleTodoCompleted(index) {
    this.controller.updateTodoCompleted(index);
  }

  createTodoItem(todo, index) {
    const todoItem = document.createElement("li");
    todoItem.className = "todo";
    todoItem.setAttribute("priority", "4");
    todoItem.setAttribute("complete", `${todo.completed}`);
    todoItem.style.cursor = "pointer";
    todoItem.innerHTML = `
      <div class="todo-tile">
        <input type="checkbox" class="todo-status" />
        <p class="title" contenteditable="false">${todo.text}</p>
      </div>
    `;
    const todoStatus = todoItem.querySelector(".todo-status");
    todoStatus.checked = todo.completed;
    todoStatus.addEventListener("change", () => {
      this.toggleTodoCompleted(index);
    });
    return todoItem;
  }

  render() {
    const todos = this.controller.getTodos();
    this.todoList.innerHTML = "";
    this.doneList.innerHTML = "";
    todos.forEach((todo, index) => {
      const todoItem = this.createTodoItem(todo, index);
      todoItem.style.textDecoration = todo.completed ? "line-through" : "none";
      if (todo.completed) {
        this.doneList.appendChild(todoItem);
      } else {
        this.todoList.appendChild(todoItem);
      }
    });
  }
}

class todoListController {
  constructor() {
    this.todoModel = new todoModel();
    this.todoListModel = new todoListModel(this);
    this.todoListView = new todoListView(this);
  }

  addTodo(text) {
    const todo = new todoModel(text);
    this.todoListModel.addTodo(todo);
    this.todoListView.render();
  }

  getTodos() {
    return this.todoListModel.getTodos();
  }

  deleteTodo() {
    this.todoListModel.deleteTodo();
    this.todoListView.render();
  }

  updateTodoText(index, text) {
    this.todoListModel.updateTodoText(index, text);
    this.todoListView.render();
  }

  updateTodoCompleted(index) {
    this.todoListModel.updateTodoCompleted(index);
    this.todoListView.render();
  }
}

const controller = new todoListController();
