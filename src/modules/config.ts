const node_env = process.env.NODE_ENV;

class Config {
  isDev: boolean;
  corsOptions: any;
  accessSecret: string;
  refreshSecret: string;
  supabaseUrl: string;
  supabaseKey: string;

  constructor() {
    const isDev = !node_env || node_env === 'development';
    this.isDev = isDev;
    process?.loadEnvFile?.(`.env.${isDev ? 'dev' : 'prod'}`);

    this.corsOptions = {
      // credentials: true,
      // origin: ['http://localhost:3000', 'exp://192.168.1.6:8081'],
      origin: ['*'],
    };
    this.accessSecret = 'accessSecret';
    this.refreshSecret = 'refreshSecret';

    this.supabaseUrl = process.env.SUPABASE_URL!;
    this.supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
  }
}

const config = new Config();
export default config;
