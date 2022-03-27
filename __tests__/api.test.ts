import Such from '../src/index';
import { AssignType } from '../src/types/instance';

describe('test api', () => {
  // test assign api
  test('assign', () => {
    // assign twice
    expect(() => {
      Such.assign('repeat_a', 1);
      Such.assign('repeat_a', 2);
    }).not.toThrow();
    // assign twice, and not equal type
    expect(() => {
      Such.assign('repeat_b', () => alert, true);
      Such.assign('repeat_b', () => alert);
    }).toThrow();
    // assign type
    expect(() => {
      // assign for a not allowed override type twice
      Such.assign('repeat_c', 1, AssignType.MustNotOverride);
      Such.assign('repeat_c', 2, AssignType.MustNotOverride);
    }).toThrow();
    expect(() => {
      // assign for a not allowed override type twice
      Such.assign('repeat_d', 1, AssignType.MustNotOverride);
      Such.assign('repeat_d', 2, AssignType.OverrideIfNotExist);
      expect(Such.getAssigned('repeat_d').value === 1).toBeTruthy();
    }).not.toThrow();
    expect(() => {
      // assign for a not allowed override type twice
      Such.assign('repeat_e', 1, AssignType.MustNotOverride);
      Such.assign('repeat_e', 2, AssignType.Override);
      expect(Such.getAssigned('repeat_e').value === 2).toBeTruthy();
    }).not.toThrow();
    expect(() => {
      // assign for a not allowed override type twice
      Such.assign('repeat_f', 1, AssignType.Override);
      Such.assign('repeat_f', 2, AssignType.Override);
      expect(Such.getAssigned('repeat_f').value === 2).toBeTruthy();
    }).not.toThrow();
    expect(() => {
      // assign for a not allowed override type twice
      Such.assign('repeat_g', 1, AssignType.Override);
      Such.assign('repeat_g', 2, AssignType.OverrideIfNotExist);
    }).toThrow();
    expect(() => {
      // assign for a not allowed override type twice
      Such.assign('repeat_g', 1, AssignType.Override);
      Such.assign('repeat_g', 2, AssignType.MustNotOverride);
    }).toThrow();
  });
});
