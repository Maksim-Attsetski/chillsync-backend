const node_env = process.env.NODE_ENV;

class Config {
  isDev: boolean;
  corsOptions: any;
  accessSecret: string;
  refreshSecret: string;

  constructor() {
    this.isDev = !node_env || node_env === 'development';
    this.corsOptions = {
      credentials: true,
      origin: ['http://localhost:3000'],
    };
    this.accessSecret = 'accessSecret';
    this.refreshSecret = 'refreshSecret';
  }
}

const config = new Config();
export default config;
