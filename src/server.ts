import * as path from "node:path";
import { fileURLToPath } from 'node:url';
import { fastify } from "fastify";
import fastifyStatic from '@fastify/static';

import {
  type Todo,
  type TodoPatch,
  initState,
  createTodo,
  deleteTodo,
  getCurrentTodoList,
  saveToFileSystem,
  updateTodo,
} from './todoList.js';

let __dirname = path.dirname(
  fileURLToPath(import.meta.url),
);

await initState();

let server = fastify({
  logger: true,
});

// HTTP + JSON 기반의 RPC (Remote Procedure Call)

server.get('/api/todos', () => {
  return getCurrentTodoList();
});

server.post('/api/todos', async (request, reply) => {
  if (request.headers["content-type"] !== 'application/json') {
    reply.status(400);
    return reply.send('지원하지 않는 컨텐츠 형식입니다.');
  }
  let { text } = request.body as any;
  let todo = await createTodo({ text });
  return todo;
});

server.get('/api/todos/:id', () => {

});

server.put('/api/todos/:id', async (request, reply) => {
  if (request.headers["content-type"] !== 'application/json') {
    reply.status(400);
    return reply.send('지원하지 않는 컨텐츠 형식입니다.');
  }

  let params = request.params as any;
  let id = params.id as string;

  let patch: TodoPatch = {
    ...request.body as Partial<Todo>,
    id: +id,
  };

  let todo = await updateTodo(patch);
  return todo;
});

server.delete('/api/todos/:id', async (request) => {
  let params = request.params as any;
  let id = params.id as string;

  await deleteTodo({ id: +id });
});

server.register(fastifyStatic, {
  root: path.join(__dirname, 'client'),
});

server.addHook('onClose', async () => {
  await saveToFileSystem();
  console.log('상태 저장됨!');
});

let address = await server.listen({
  port: 3000,
});

console.log(`서버 켜짐: ${address}`);
