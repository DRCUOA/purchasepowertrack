import { createApp } from './app.js';
import { config } from './config.js';
import { installLogCapture } from './services/log-stream.js';

installLogCapture();

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
});
