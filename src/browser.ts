import { default as Conf } from './config/recommend';
import Such from './such';
import { TObject } from './types';
Such.config(Conf);
(window as TObject).Such = Such;
