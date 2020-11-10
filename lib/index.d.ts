import Such from './core/such';
import { TNodeSuch, TSuchSettings } from './types/node';
declare const NSuch: typeof Such & TNodeSuch;
declare function loadConf(name: string): TSuchSettings;
declare function loadConf(name: string[]): TSuchSettings[];
export { loadConf };
export default NSuch;
