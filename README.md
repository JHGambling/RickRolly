# Rick Rolly
This is the Rick Rolly roulette game for JHGambling.

A European-style roulette game with an interactive betting table and wheel animation. Features multiple betting options including individual numbers and color bets.

## Features

- European roulette wheel with 37 numbers (0-36)
- Interactive betting table for placing chips
- Multiple chip denominations ($10, $50, $100, $500)
- Number and color betting options
- Realistic wheel spinning animation
- Win/loss animations with confetti effects
- Casino SDK integration for wallet management

## Development

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Docker

Build and run with Docker:
```bash
docker build -t rickrolly .
docker run -p 8080:80 rickrolly
```

## Game Rules

- Place bets by clicking on the betting table
- Number bets pay 36:1
- Color bets (red/black) pay 2:1
- Zero (green) wins only for direct number bets
- Click chips to remove bets and get refunds
- Must place at least one bet to spin the wheel

## SDK Integration

The game integrates with the JHGambling Casino SDK for:
- User authentication
- Wallet management
- Transaction processing
- Session handling

URL parameters:
- `wsUrl`: WebSocket URL for casino server
- `token`: Authentication token
- `session`: Session ID
- `usesdk`: Enable SDK integration