export const invoke = jest.fn(async (command: string, args?: any) => {
  console.log("Mock invoke called with:", command, args);
  if (command === 'get_settings') {
    return Promise.resolve({
      version: 1,
      db_path: '/fake/test.db',
      theme: 'dark',
    });
  }
  if (command === 'set_settings') {
    return Promise.resolve();
  }
  if (command === 'validate_db') {
    return Promise.resolve({ ok: true, message: 'Mock validation successful' });
  }
  if (command === 'backup_db') {
    return Promise.resolve({ ok: true, message: 'Mock backup successful' });
  }
  return Promise.reject(new Error(`Unknown command: ${command}`));
});

export const listen = jest.fn(async (event: string, handler: Function) => {
  console.log("Mock listen called for event:", event);
  // Return a dummy unlisten function
  return Promise.resolve(() => {
    console.log("Mock unlisten called for event:", event);
  });
});

export const open = jest.fn(async (options?: any) => {
  console.log("Mock dialog.open called with options:", options);
  return Promise.resolve("/mock/selected/file.db");
});
