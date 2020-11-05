import { default as Conf } from './config/recommend';
import Such from './such';
import { TObj } from './types';
Such.config(Conf);
(window as TObj).Such = Such;
