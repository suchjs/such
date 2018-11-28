
import { default as Conf } from './config/recommend';
import Such from './such';
import { NormalObject } from './types';
Such.config(Conf);
(window as NormalObject).Such = Such;
