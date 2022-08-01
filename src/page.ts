import { default as Conf } from "./extends/recommend";
import { Such, createNsSuch } from "./core/such";
import { AssignType, SpecialType } from "./types/instance";
// add browser supported type
import dict from "./browser/mockit/dict";
import cascader from "./browser/mockit/cascader";
// add mockit list
import { addMockitList, builtinMockits } from "./data/mockit";
// add dict/cascader
addMockitList(builtinMockits, true);
addMockitList(
  {
    dict,
    cascader,
  },
  true,
);
const root = new Such();
root.config(Conf);

export default {
  root,
  createNsSuch,
  AssignType,
  SpecialType
};

