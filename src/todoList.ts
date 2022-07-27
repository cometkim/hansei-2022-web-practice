import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export type Todo = {
  id: number,
  text: string,
  checked: boolean,
};

export type TodoPatch = Pick<Todo, 'id'> & Partial<Todo>;

export type Filter = 'all' | 'active' | 'completed';

let idSeq = 0;
let filter: Filter = 'all';
let allTodoList: Todo[] = [];

let allChecked = false;
let someChecked = false;
let activeTodoList: Todo[] = [];
let completedTodoList: Todo[] = [];

let filePath = path.join(process.cwd(), 'todos.json');

export async function initState() {
  try {
    await loadFromFileSystem();
  } catch (e) {
    console.warn(e.message);
    await saveToFileSystem();
  }
}

export async function saveToFileSystem() {
  let state = {
    idSeq,
    filter,
    allTodoList,
  };
  await fs.writeFile(
    filePath,
    JSON.stringify(state),
    'utf-8',
  );
}

async function loadFromFileSystem() {
  let data = await fs.readFile(filePath, 'utf-8');
  let state = JSON.parse(data);
  idSeq = state.idSeq;
  filter = state.filter;
  allTodoList = state.allTodoList;
}

export function getCurrentTodoList() {
  switch (filter) {
    case 'all':
      return allTodoList;
    case 'active':
      return activeTodoList;
    case 'completed':
      return completedTodoList;
  }
}

type UpdaterCallback = (todoList: Todo[]) => Todo[];

export async function updateTodoList(callback: UpdaterCallback) {
  allTodoList = callback(allTodoList);
  await saveToFileSystem();

  allChecked = allTodoList.every(todo => todo.checked);
  someChecked = allTodoList.some(todo => todo.checked);

  activeTodoList = allTodoList
    .filter(todo => todo.checked === false);

  completedTodoList = allTodoList
    .filter(todo => todo.checked === true);
}

export async function setTodoListFilter(newFilter: Filter) {
  filter = newFilter;
  await saveToFileSystem();
}

export async function createTodo({ text }: Pick<Todo, 'text'>) {
  let todo = {
    id: idSeq++,
    text,
    checked: false,
  };
  await updateTodoList(todoList => {
    return [...todoList, todo];
  });
  return todo;
}

export async function deleteTodo({ id }: Pick<Todo, 'id'>) {
  await updateTodoList(todoList => {
    return todoList.filter(todo => todo.id !== id);
  });
}

export async function updateTodo(patch: TodoPatch) {
  let updated: Todo | null = null;
  await updateTodoList(todoList => {
    return todoList.map(todo => {
      if (todo.id === patch.id) {
        updated = { ...todo, ...patch };
        return updated;
      } else {
        return todo;
      }
    });
  });
  return updated;
}

export async function clearCompleted() {
  await updateTodoList(todoList => {
    return todoList.flatMap(todo => {
      if (todo.checked) {
        return [];
      }
      return todo;
    })
  })
}

export async function checkAll() {
  await updateTodoList(todoList => {
    return todoList.map(todo => ({
      ...todo,
      checked: true,
    }));
  });
}

export async function uncheckAll() {
  await updateTodoList(todoList => {
    return todoList.map(todo => ({
      ...todo,
      checked: false,
    }));
  });
}

export async function toggleAll() {
  if (allChecked) {
    await uncheckAll();
  } else {
    await checkAll();
  }
}
