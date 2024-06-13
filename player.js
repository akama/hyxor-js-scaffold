const WebSocket = require('ws');

// Game configuration
const serverURL = 'ws://coresrv:9091';
const playerName = process.env.PLAYER || 'PLAYER';

// WebSocket connection
const ws = new WebSocket(serverURL);

// Game state
let gameState = {
  tick: 0,
  players: [],
  systems: new Map(),
  fleets: [],
  stats: {
    ship_cnt: [],
    system_cnt: [],
  },
};

// WebSocket event handlers
ws.on('open', () => {
  console.log('Connected to the game server');
});

ws.on('message', (data) => {
  const message = JSON.parse(data);

  // Update game state based on the received message
  gameState.tick = message.tick;
  gameState.players = message.players;
  gameState.stats = message.stats;
  console.log(`Processing tick: ${gameState.tick}`)

  // Update systems map
  message.systems.forEach((system) => {
    gameState.systems.set(system.id, system);
  });

  gameState.fleets = message.fleets

  // Call the strategy function to make moves
  makeMove();
});

ws.on('close', () => {
  console.log('Disconnected from the game server');
});

// Function to send moves to the server
function sendMove(originId, destinationId, shipCount) {
  const move = `MOV ${playerName} ${originId} ${destinationId} ${shipCount}`;
  console.log('Sending data: ' + move);
  ws.send(move);
}

// Function to send upgrades to the server
function sendUpgrade(destinationId) {
  const move = `UPG ${playerName} ${destinationId}`;
  console.log('Sending data: ' + move);
  ws.send(move);
}


// Strategy function (to be implemented)
function makeMove() {
  // Implement your game strategy here
  // Analyze the current game state (gameState object)
  // Make decisions on which moves to make
  // Use the sendMove function to send moves to the server
  gameState.systems.forEach((system) => {
    if (system.fleets.length === 1 && system.fleets[0].owner === playerName && system.fleets[0].count > 20) {
      if (Math.random() < 0.25) {
        let randomTarget = Math.floor(Math.random() * (gameState.systems.size - 0)) + 0;
        sendMove(system.id, randomTarget, 20)
      } else {
        sendUpgrade(system.id)
      }
    }
  });
}
