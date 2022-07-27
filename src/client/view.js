import {
  createTodo,
  updateTodo,
  deleteTodo,
  getCurrentTodoList,
} from './api.js';

let todoListElement = document.getElementById('todo-list');
let todoToggleElement = document.getElementById('todo-toggle');
let todoFormElement = document.getElementById('todo-form');

let todoMap = new Map(
  (await getCurrentTodoList())
    .map(todo => [todo.id, todo]),
);

renderTodoList(todoMap.values());

todoFormElement.addEventListener('submit', async event => {
  event.preventDefault();

  let value = todoInputElement.value;
  if (!value) {
    return;
  }

  let todo = await createTodo({ text: value });
  todoMap.set(todo.id, todo);
  renderTodoList(todoMap.values());

  todoInputElement.value = '';
});

function createTodoItemElement(todo) {
  let id = todo.id;
  let template = document.getElementById('todo-item-template');
  let fragment = document.importNode(template.content, true);

  let item = fragment.querySelector('li');
  item.id = id;

  let textElement = fragment.querySelector('p');
  textElement.textContent = todo.text;

  let checkbox = fragment.querySelector('input');
  checkbox.checked = todo.checked;
  checkbox.addEventListener('change', async e => {
    let updated = await updateTodo({
      ...todo,
      checked: e.target.checked,
    });
    todoMap.set(todo.id, updated);
    renderTodoList(todoMap.values());
  });

  let deleteButton = fragment.querySelector('button');
  deleteButton.addEventListener('click', async () => {
    await deleteTodo({ id });
    todoMap.delete(todo.id);
    renderTodoList(todoMap.values());
  });

  return item;
}

export function renderTodoList(todoList) {
  todoListElement.textContent = '';
  for (let todo of todoList) {
    let todoItem = createTodoItemElement(todo);
    todoListElement.appendChild(todoItem);
  }

  // todoToggleElement.checked = currentTodoList.length && allChecked;
  // if (someChecked) {
  //   document.body.classList.add('some-checked');
  // } else {
  //   document.body.classList.remove('some-checked');
  // }
}

export function setTodoListFilter(newFilter) {
}

export function clearCompleted() {
}

export function checkAll() {
}

export function uncheckAll() {
}

export function toggleAll() {
}
