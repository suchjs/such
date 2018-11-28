import RegexpParser from '../../src/helpers/regexp';
import { NormalObject } from '../../src/types';
const makeInstance = (context: string, key?: string) => {
  return () => {
    return getInstance(context, key);
  };
};
const getInstance = (context: string, key?: string) => {
  const instance = new RegexpParser(context);
  return key ? (instance.info() as NormalObject)[key] : instance;
};
const getQueuesType = (context: string) => {
  const types = getInstance(context, 'queues').map((item: NormalObject) => item.type);
  return types;
};
describe('validate class regexp parser', () => {
  test('regexp rule', () => {
    expect(makeInstance('/\/')).toThrow();
    expect(makeInstance('//')).toThrow();
    expect(makeInstance('//i')).toThrow();
    expect(makeInstance('/a/ii')).toThrow();
  });
  test('regexp parse rule', () => {
    expect(makeInstance('/(/')).toThrow();
    expect(makeInstance('/)/')).toThrow();
    expect(makeInstance('/[/')).toThrow();
  });
  test('regexp parse queues', () => {
    expect(getQueuesType('/(a)/')).toContain('group');
  });
});
