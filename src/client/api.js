export async function getCurrentTodoList() {
  let response = await fetch('/api/todos');
  let body = await response.json();
  return body;
}

export async function createTodo({ text }) {
  let response = await fetch('/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
    }),
  });
  let todo = await response.json();
  return todo;
}

export async function updateTodo(patch) {
  let response = await fetch(`/api/todos/${patch.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patch),
  });
  let todo = await response.json();
  return todo;
}

export async function deleteTodo({ id }) {
  await fetch(`/api/todos/${id}`, {
    method: 'DELETE',
  });
}

