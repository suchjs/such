import { IParserFactory, IPPConfig } from "../types/parser";
import { decodeTrans, getExp, hasOwn } from "../helpers/utils";
import { AParser } from "../core/parser";
import { VariableExpression } from "../data/config";

const parser: IParserFactory = {
	/**
   * config syntax: #[a = 1, b = 2]
   */
	config: {
		startTag: ["#["],
		endTag: ["]"],
		separator: ",",
		pattern:
			/\s*([a-zA-Z_$][\w$]*)\s*(?:=\s*(?:(['"])((?:(?!\2)[^\\]|\\.)*)\2|((?:\[(?:\d+|(['"])(?:(?!\5)[^\\]|\\.)*\5)\]|[^\s,\]])+))\s*)?/,
	},
	/**
   *
   * @param this [APaser]
   * @returns [IPPConfig] a config object
   */
	parse(this: AParser): IPPConfig | never {
		const { params } = this.info();
		const config: IPPConfig = {};
		if (params.length) {
			const rule =
				/^\s*([a-zA-Z_$][\w$]*)\s*(?:=\s*(?:(['"])((?:(?!\2)[^\\]|\\.)*)\2|((?:\[(?:\d+|(['"])(?:(?!\5)[^\\]|\\.)*\5)\]|[^\s,\]])+))\s*)?$/;
			const nativeValues = ["true", "false", "null", "undefined", "NaN"];
			for (let i = 0, j = params.length; i < j; i++) {
				const param = params[i];
				if (rule.test(param)) {
					const { $1: key, $2: quote, $3: strValue, $4: plainValue } = RegExp;
					if (hasOwn(config, key)) {
						throw new Error(
							`the config of "${key}" has exists,do not define repeatly.`,
						);
					}
					if (quote) {
						config[key] = decodeTrans(strValue);
					} else if (plainValue) {
						const value = plainValue;
						if (!isNaN(Number(value))) {
							config[key] = Number(value);
						} else if (nativeValues.indexOf(value) > -1) {
							config[key] = getExp(value);
						} else {
							// expression or variable
							config[key] = new VariableExpression(value);
						}
					} else {
						config[key] = true;
					}
				} else {
					this.halt(
						`[index: ${i}] The configuration of "${param}" is not a valid supported value, please check it.`,
					);
				}
			}
		}
		return config;
	},
	/**
   * config won't frozen
   */
	setting: {
		frozen: false,
	},
};
export default parser;
