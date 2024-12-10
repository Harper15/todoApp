import "./styles.css";
import { format, formatRelative, startOfToday, sub } from "date-fns";

// todo - add projects
// todo - create a function that saves projects and todos to local storage
// todo - create a function that loads projects and todos from local storage on first load
// todo - add methods to objects returned from local storage to ensure they function as expected

class subtaskModel {
  constructor(text) {
    this.text = text;
    this.completed = false;
  }
}

class todoModel {
  constructor(text, description = "", priority = 4, dueDate = new Date()) {
    this.index = 0;
    this.text = text;
    this.completed = false;
    this.description = description;
    this.priority = priority;
    this.dueDate = format(dueDate, "yyyy-MM-dd");
    this.subtasks = [];
  }

  addSubtask(subtask) {
    this.subtasks.push(subtask);
  }

  getSubtasks() {
    return this.subtasks;
  }

  deleteSubtask(subtaskIndex) {
    this.subtasks.splice(subtaskIndex, 1);
  }

  updateSubtaskText(index, text) {
    this.subtasks[index].text = text;
  }

  updateSubtaskCompleted(index) {
    this.subtasks[index].completed = !this.subtasks[index].completed;
  }
}

class todoListModel {
  constructor(controller) {
    this.controller = controller;
    this.todos = [
      new todoModel("First todo", "This is the first todo"),
      new todoModel("Second todo", "This is the second todo"),
      new todoModel("Third todo", "This is the third todo"),
    ];
  }

  addTodo(todo) {
    this.todos.push(todo);
  }

  getTodos() {
    return this.todos;
  }

  deleteTodo(index) {
    this.todos.splice(index, 1);
  }

  updateTodoText(index, text) {
    this.todos[index].text = text;
  }

  updateTodoDueDate(index, dueDate) {
    this.todos[index].dueDate = dueDate;
  }

  updateTodoPriority(index, priority) {
    this.todos[index].priority = priority;
  }

  updateTodoCompleted(index) {
    this.todos[index].completed = !this.todos[index].completed;
  }
}

class subtaskListView {
  constructor(controller) {
    this.controller = controller;
  }

  updateSubtaskCompleted(todo, index) {
    this.controller.updateSubtaskCompleted(todo, index);
  }

  createSubtask(todo, subtask, index) {
    const taskItem = document.createElement("li");
    taskItem.className = "todo";
    taskItem.setAttribute("complete", `${subtask.completed}`);
    taskItem.style.cursor = "pointer";
    taskItem.innerHTML = `
      <div class="todo" data-index=${index}>
        <div class="todo-tile">
          <input type="checkbox" class="todo-status" />
          <p class="title" contenteditable="false">${subtask.text}</p>
        </div>
        <button class="delete" data-index="${index}">X</button>
      </div>
    `;

    const taskStatus = taskItem.querySelector(".todo-status");
    taskStatus.checked = subtask.completed;
    taskStatus.addEventListener("change", () => {
      this.updateSubtaskCompleted(todo, index);
    });

    const deleteTaskButton = taskItem.querySelector("button.delete");
    deleteTaskButton.addEventListener("click", () => {
      this.controller.deleteSubtask(
        todo,
        deleteTaskButton.getAttribute("data-index")
      );
    });

    const taskTitle = taskItem.querySelector("p.title");
    const currentText = taskTitle.textContent;
    taskTitle.addEventListener("click", () => {
      taskTitle.setAttribute("contenteditable", "true");
      taskTitle.focus();
    });
    taskTitle.addEventListener("focusout", () => {
      taskTitle.setAttribute("contenteditable", "false");
      taskTitle.innerText = currentText;
    });
    taskTitle.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.controller.updateSubtaskText(todo, index, taskTitle.textContent);
        taskTitle.setAttribute("contenteditable", "false");
      } else if (e.key === "Escape") {
        taskTitle.innerText = currentText;
        taskTitle.setAttribute("contenteditable", "false");
      }
    });

    return taskItem;
  }

  render(todo) {
    const allSubtaskLists = document.querySelectorAll("ul.subtask-list");
    const subtaskList = Array.from(allSubtaskLists).find(
      (list) => list.getAttribute("data-index") === todo.index.toString()
    );
    subtaskList.innerHTML = "";
    todo.getSubtasks().forEach((subtask, index) => {
      const taskItem = this.createSubtask(todo, subtask, index);
      taskItem.style.textDecoration = subtask.completed
        ? "line-through"
        : "none";
      subtaskList.appendChild(taskItem);
    });
  }
}

class todoListView {
  constructor(controller) {
    this.controller = controller;
    this.todoList = document.querySelector("ul.todo-list");
    this.doneList = document.querySelector("ul.completed-list");
    this.addTodoTextButton = document.querySelector("p.add-todo");
    this.addTodoButton = document.querySelector("button.add-todo");
    this.addTodoInput = document.querySelector("input.add-todo-input");
    this.sortTodos = document.querySelector("select.sort-todos");
    this.addTodoTextButton.addEventListener("click", () => {
      this.addTodoTextButton.style.display = "none";
      this.toggleInput(this.addTodoInput, this.todoList);
    });
    this.addTodoButton.addEventListener("click", () => {
      this.addTodoTextButton.style.display = "none";
      this.toggleInput(this.addTodoInput, this.todoList);
    });
    this.addTodoInput.addEventListener("focusout", () => {
      this.addTodoInput.style.display = "none";
      this.addTodoTextButton.style.display = "block";
    });
    this.addTodoInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.controller.addTodo(this.addTodoInput.value);
        this.addTodoInput.style.display = "none";
        this.addTodoTextButton.style.display = "block";
      } else if (e.key === "Escape") {
        this.addTodoInput.style.display = "none";
        this.addTodoTextButton.style.display = "block";
      }
    });
    this.sortTodos.addEventListener("change", () => {
      this.sortTodoList(this.sortTodos.value);
    });
  }

  toggleInput(input, list) {
    input.value = "";
    input.style.display = "block";
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Add a todo");
    list.insertAdjacentElement("afterend", input);
    input.focus();
  }

  editTodoText(item, index) {
    const currentText = item.textContent;
    item.setAttribute("contenteditable", "true");
    item.focus();
    item.addEventListener("focusout", () => {
      item.innerText = currentText;
      item.setAttribute("contenteditable", "false");
    });
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.controller.updateTodoText(index, item.textContent);
        item.setAttribute("contenteditable", "false");
      } else if (e.key === "Escape") {
        item.innerText = currentText;
        item.setAttribute("contenteditable", "false");
      }
    });
  }

  editDueDate(item, index) {
    const newDueDate = item.value;
    if (newDueDate === "") {
      return;
    } else if (newDueDate === this.controller.getTodos()[index].dueDate) {
      return;
    }
    const newRelativeDueDate = this.getRelativeDueDate(newDueDate);
    const currentRelativeDueDate =
      item.parentElement.parentElement.parentElement.querySelector(
        "p.due-date"
      );
    currentRelativeDueDate.innerText = newRelativeDueDate;
    this.controller.updateTodoDueDate(index, newDueDate);
  }

  getRelativeDueDate(dueDate) {
    return formatRelative(dueDate.concat("T00:00:00"), startOfToday()).replace(
      / at .*/,
      ""
    );
  }

  editPriority(todo, item, index) {
    const newPriority = item.value;
    if (newPriority === this.controller.getTodos()[index].priority) {
      console.log("same priority");
      return;
    }
    this.setPriorityColor(todo, newPriority);
    this.controller.updateTodoPriority(index, newPriority);
  }

  setPriorityColor(todo, priority) {
    todo.setAttribute("priority", priority);
    const borderColor = `var(--priority-${priority}-color)`;
    todo.querySelector("div.todo").style.border = `1px solid ${borderColor}`;
    todo.querySelector(
      "div.todo-tile"
    ).style.border = `1px solid ${borderColor}`;
  }

  sortTodoList(sortBy) {
    const todos = this.controller.getTodos();
    if (sortBy === "priority") {
      todos.sort((a, b) => a.priority - b.priority);
    }
    this.controller.todoListModel.todos = todos;
    this.render();
  }

  toggleTodoCompleted(index) {
    this.controller.updateTodoCompleted(index);
  }

  createTodoItem(todo, index) {
    todo.index = index;
    const todoItem = document.createElement("li");
    todoItem.className = "todo";
    todoItem.setAttribute("data-index", `${index}`);
    todoItem.setAttribute("priority", `${todo.priority}`);
    todoItem.setAttribute("complete", `${todo.completed}`);
    todoItem.style.cursor = "pointer";
    const relativeDueDate = this.getRelativeDueDate(todo.dueDate);
    todoItem.innerHTML = `
      <div class="todo">
        <div class="todo-tile">
          <input type="checkbox" class="todo-status" />
          <p class="title" contenteditable="false">${todo.text}</p>
          <div class="todo-info">
            <p class="due-date">${relativeDueDate}</p>
            <button class="toggle" state="closed">></button>
          </div>
        </div>
        <div class="details">
          <div class="detail-settings">
            <textarea type="text" class="description">${todo.description}</textarea>
            <div class="edit-section">
              <input type="date" class="due-date" value=${todo.dueDate} />
              <div class="other-settings">
                <select class="priority">
                  <option value="1">High</option>
                  <option value="2">Medium</option>
                  <option value="3">Low</option>
                  <option value="4" selected>None</option>
                </select>
                <button class="add-subtask">Add subtask</button>
              </div>
            </div>
          </div>
          <ul class="subtask-list" data-index=${index}>
          </ul>
          <input type="text" class="subtask-input" placeholder="Add a subtask" />
        </div>
      </div>
      <button class="delete" data-index="${index}">X</button>
    `;
    const todoStatus = todoItem.querySelector(".todo-status");
    todoStatus.checked = todo.completed;
    todoStatus.addEventListener("change", () => {
      this.toggleTodoCompleted(index);
    });

    const dropdownButton = todoItem.querySelector("button.toggle");
    const details = todoItem.querySelector(".details");
    details.style.display = "none";
    dropdownButton.addEventListener("click", () => {
      if (dropdownButton.getAttribute("state") === "closed") {
        details.style.display = "flex";
        dropdownButton.setAttribute("state", "open");
        dropdownButton.style.transform = "rotate(90deg)";
      } else {
        details.style.display = "none";
        dropdownButton.setAttribute("state", "closed");
        dropdownButton.style.transform = "rotate(0deg)";
      }
    });

    const deleteTodoButton = todoItem.querySelector("button.delete");
    deleteTodoButton.addEventListener("click", () => {
      this.controller.deleteTodo(deleteTodoButton.getAttribute("data-index"));
    });

    const todoTitle = todoItem.querySelector("div.todo p.title");
    todoTitle.addEventListener("click", () => {
      this.editTodoText(todoTitle, index);
    });

    const todoDueDate = todoItem.querySelector("div.todo input.due-date");
    todoDueDate.addEventListener("change", () => {
      this.editDueDate(todoDueDate, index);
    });

    this.setPriorityColor(todoItem, todoItem.getAttribute("priority"));
    const prioritySelect = todoItem.querySelector("select.priority");
    prioritySelect.value = todo.priority;

    const todoPriority = todoItem.querySelector("div.todo select.priority");
    todoPriority.addEventListener("change", () => {
      this.editPriority(todoItem, todoPriority, index);
      this.sortTodoList(this.sortTodos.value);
    });

    const subtaskInput = todoItem.querySelector("input.subtask-input");
    subtaskInput.style.display = "none";
    const addSubtaskButton = todoItem.querySelector("button.add-subtask");
    addSubtaskButton.addEventListener("click", () => {
      subtaskInput.style.display = "block";
      this.toggleInput(subtaskInput, todoItem.querySelector("ul.subtask-list"));
    });
    subtaskInput.addEventListener("focusout", () => {
      subtaskInput.style.display = "none";
    });
    subtaskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.controller.addSubtask(todo, subtaskInput.value);
        subtaskInput.style.display = "none";
      } else if (e.key === "Escape") {
        subtaskInput.style.display = "none";
      }
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
    this.subtaskModel = new subtaskModel();
    this.todoModel = new todoModel();
    this.todoListModel = new todoListModel(this);
    this.subtaskListView = new subtaskListView(this);
    this.todoListView = new todoListView(this);
  }

  addTodo(text, description) {
    const todo = new todoModel(text, description);
    this.todoListModel.addTodo(todo);
    this.todoListView.render();
  }

  getTodos() {
    return this.todoListModel.getTodos();
  }

  deleteTodo(index) {
    this.todoListModel.deleteTodo(index);
    this.todoListView.render();
  }

  updateTodoText(index, text) {
    this.todoListModel.updateTodoText(index, text);
    this.todoListView.render();
  }

  updateTodoDueDate(index, dueDate) {
    this.todoListModel.updateTodoDueDate(index, dueDate);
    this.todoListView.render();
  }

  updateTodoPriority(index, priority) {
    this.todoListModel.updateTodoPriority(index, priority);
    this.todoListView.render();
  }

  updateTodoCompleted(index) {
    this.todoListModel.updateTodoCompleted(index);
    this.todoListView.render();
  }

  addSubtask(todo, text) {
    const subtask = new subtaskModel(text);
    todo.addSubtask(subtask);
    this.subtaskListView.render(todo);
  }

  getSubtasks(todo) {
    return todo.getSubtasks();
  }

  deleteSubtask(todo, index) {
    todo.deleteSubtask(index);
    this.subtaskListView.render(todo);
  }

  updateSubtaskText(todo, index, text) {
    todo.updateSubtaskText(index, text);
    this.subtaskListView.render(todo);
  }

  updateSubtaskCompleted(todo, index) {
    todo.updateSubtaskCompleted(index);
    this.subtaskListView.render(todo);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const controller = new todoListController();
  controller.todoListView.render();
});
