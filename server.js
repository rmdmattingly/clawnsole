const { createClawnsoleServer } = require('./clawnsole-server');

const { server, port, host } = createClawnsoleServer();

server.listen(port, host, () => {
  console.log(`Clawnsole server running on http://localhost:${port}`);
});

