import { createClient } from '@supabase/supabase-js';

import config from './config';

export const supa = createClient(config.supabaseUrl, config.supabaseKey);

export enum EBucketNames {
  NEWS = 'news',
}
