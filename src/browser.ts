import { default as Conf } from './extends/recommend';
import Such from './core/such';
import { TObj } from './types/common';
Such.config(Conf);
(window as TObj).Such = Such;
