import "./styles.css";
import { format, formatRelative, startOfToday } from "date-fns";

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

  addSubtask(index, subtask) {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    if (!todos[index]) {
      console.error(`Todo at index ${index} not found`);
      return;
    }
    const todoSubtasks = todos[index].subtasks || [];
    todoSubtasks.push(subtask);
    todos[index].subtasks = todoSubtasks;
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  getSubtasks(index) {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    if (!todos[index]) {
      console.error(`Todo at index ${index} not found`);
      return [];
    }
    return todos[index].subtasks || [];
  }

  deleteSubtask(index, subtaskIndex) {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    if (!todos[index]) {
      console.error(`Todo at index ${index} not found`);
      return;
    }
    const todoSubtasks = todos[index].subtasks || [];
    todoSubtasks.splice(subtaskIndex, 1);
    todos[index].subtasks = todoSubtasks;
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  updateSubtaskText(index, subtaskIndex, text) {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    if (!todos[index]) {
      console.error(`Todo at index ${index} not found`);
      return;
    }
    const todoSubtasks = todos[index].subtasks || [];
    todoSubtasks[subtaskIndex].text = text;
    todos[index].subtasks = todoSubtasks;
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  updateSubtaskCompleted(index, subtaskIndex) {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    if (!todos[index]) {
      console.error(`Todo at index ${index} not found`);
      return;
    }
    const todoSubtasks = todos[index].subtasks || [];
    todoSubtasks[subtaskIndex].completed =
      !todoSubtasks[subtaskIndex].completed;
    todos[index].subtasks = todoSubtasks;
    localStorage.setItem("todos", JSON.stringify(todos));
  }
}

class todoListModel {
  constructor(controller) {
    this.controller = controller;
    this.todos = [];
  }

  addTodo(text) {
    const todo = new todoModel(text);
    todo.index = this.todos.length;
    this.todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  getTodos() {
    this.todos = JSON.parse(localStorage.getItem("todos"));
    return this.todos;
  }

  deleteTodo(index) {
    this.todos.splice(index, 1);
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  updateTodoText(index, text) {
    this.todos[index].text = text;
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  updateTodoDueDate(index, dueDate) {
    this.todos[index].dueDate = dueDate;
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  updateTodoPriority(index, priority) {
    this.todos[index].priority = priority;
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  updateTodoCompleted(index) {
    this.todos[index].completed = !this.todos[index].completed;
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }
}

class subtaskListView {
  constructor(controller) {
    this.controller = controller;
  }

  updateSubtaskCompleted(todoIndex, subtaskIndex) {
    this.controller.updateSubtaskCompleted(todoIndex, subtaskIndex);
  }

  createSubtask(todoIndex, subtask, index) {
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
      this.updateSubtaskCompleted(todoIndex, index);
    });

    const deleteTaskButton = taskItem.querySelector("button.delete");
    deleteTaskButton.addEventListener("click", () => {
      this.controller.deleteSubtask(
        todoIndex,
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
        this.controller.updateSubtaskText(
          todoIndex,
          index,
          taskTitle.textContent
        );
        taskTitle.setAttribute("contenteditable", "false");
      } else if (e.key === "Escape") {
        taskTitle.innerText = currentText;
        taskTitle.setAttribute("contenteditable", "false");
      }
    });

    return taskItem;
  }

  render(todoIndex) {
    const allSubtaskLists = document.querySelectorAll("ul.subtask-list");
    const subtaskList = Array.from(allSubtaskLists).find(
      (list) => list.getAttribute("data-index") === todoIndex.toString()
    );
    subtaskList.innerHTML = "";
    const allSubtasks = this.controller.getSubtasks(todoIndex);
    allSubtasks.forEach((subtask, index) => {
      const taskItem = this.createSubtask(todoIndex, subtask, index);
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
    if (newDueDate === "" || newDueDate === null) {
      return;
    } else if (newDueDate === this.controller.getTodos()[index].dueDate) {
      return;
    }
    const newRelativeDueDate = this.getRelativeDueDate(newDueDate);
    const currentRelativeDueDate =
      item.parentElement.parentElement.parentElement.querySelector(
        "input.due-date"
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
    localStorage.setItem("todos", JSON.stringify(todos));
    this.render();
  }

  updateTodoCounter() {
    const todos = this.controller.getTodos();
    const todoCounter = document.querySelector("p.todo-counter");
    const totalTodos = todos.length;
    todoCounter.innerText = `Todos: ${totalTodos}`;
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
        this.controller.addSubtask(todo["index"], subtaskInput.value);
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
      this.controller.subtaskListView.render(index);
    });
    this.updateTodoCounter();
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
    this.todoListModel.addTodo(text, description);
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

  addSubtask(todoIndex, text) {
    const subtask = new subtaskModel(text);
    this.todoModel.addSubtask(todoIndex, subtask);
    this.subtaskListView.render(todoIndex);
  }

  getSubtasks(index) {
    return this.todoModel.getSubtasks(index);
  }

  deleteSubtask(todoIndex, index) {
    this.todoModel.deleteSubtask(todoIndex, index);
    this.subtaskListView.render(todoIndex);
  }

  updateSubtaskText(todoIndex, index, text) {
    this.todoModel.updateSubtaskText(todoIndex, index, text);
    this.subtaskListView.render(todoIndex);
  }

  updateSubtaskCompleted(todoIndex, index) {
    this.todoModel.updateSubtaskCompleted(todoIndex, index);
    this.subtaskListView.render(todoIndex);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const controller = new todoListController();
  if (
    localStorage.getItem("todos") === null ||
    localStorage.getItem("todos") === "[]"
  ) {
    controller.addTodo("First todo", "This is the first todo");
    controller.addTodo("Second todo", "This is the second todo");
    controller.addTodo("Third todo", "This is the third todo");
  }
  controller.todoListView.render();
});
