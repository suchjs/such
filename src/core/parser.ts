import { IParserConfig } from "../types/parser";
import {
	encodeSplitor,
	encodeRegexpChars,
	splitor as confSplitor,
} from "../data/config";
import { hasOwn, isArray } from "../helpers/utils";
import { TMatchResult, TObj, TStrList } from "../types/common";
import Mockit from "./mockit";
export interface Tags {
	start: string;
	end: string;
}
export interface IParserConstructor extends IParserConfig {
	readonly splitor?: string;
	new (): AParser;
}
/**
 * Abstract Property Parser
 * @interface AParser
 */
export abstract class AParser {
	// params
	public params: TStrList;
	// patterns
	public patterns: TMatchResult[] = [];
	// tags
	public tags: Tags;
	// code
	public code = "";
	// setting
	public setting: TObj = {
		frozen: true,
	};
	// constructor
	protected constructor() {
		this.init();
	}
	/**
   * @returns AParser instance
   * @memberof AParser
   */
	public init(): AParser {
		return this;
	}
	/**
   * @returns information data of the parser
   * @memberof AParser
   */
	public info(): Pick<AParser, "tags" | "params" | "code" | "patterns"> {
		const { tags, params, code, patterns } = this;
		return {
			tags,
			params,
			code,
			patterns,
		};
	}
	/**
   * @param {string} code
   * @param {Tags} tags
   * @memberof AParser
   */
	public parseCode(code: string, tags: Tags): void {
		this.code = code;
		this.tags = tags;
		const { start, end } = tags;
		const constr = this.constructor as IParserConstructor;
		const { separator, pattern } = constr;
		if (separator || end) {
			const params = [];
			const sliceInfo = [start.length].concat(end ? -end.length : []);
			const res = code.slice(...sliceInfo);
			if (pattern) {
				let match: TMatchResult | null = null;
				let curCode: string = res;
				let len = 0;
				const total = res.length;
				while (len < total && (match = curCode.match(pattern)) !== null) {
					const segLen = match[0].length;
					len += segLen;
					const sep = res.charAt(len);
					if (segLen === 0) {
						throw new Error(
							`the pattern rule "${pattern.toString()}" match nothing to the string:${curCode}`,
						);
					} else if (len < total && sep !== separator) {
						throw new Error(
							`unexpected separator character "${sep}" in "${curCode.slice(
								len,
							)}",expect to be "${separator}"`,
						);
					} else {
						len += 1;
						curCode = curCode.slice(segLen + 1);
						params.push(match[0]);
						pattern.lastIndex = 0;
						this.patterns.push(match);
					}
				}
			} else {
				let seg = "";
				for (let i = 0, j = res.length; i < j; i++) {
					const cur = res.charAt(i);
					if (cur === "\\") {
						seg += `\\${res.charAt(++i)}`;
					} else {
						if (cur === separator) {
							params.push(seg);
							seg = "";
						} else {
							seg += cur;
						}
					}
				}
				if (params.length || seg) {
					params.push(seg);
				}
			}
			this.params = params;
		} else {
			this.params = [code];
		}
	}
	/**
   * @abstract
   * @returns {Object|never}
   * @memberof AParser
   */
	public abstract parse(): unknown | never;
	/**
   * @protected
   * @param {string} err
   * @returns {never}
   * @memberof AParser
   */
	protected halt(err: string): never {
		throw new Error(err);
	}
}
//
export interface IParserList {
	[index: string]: IParserConstructor;
}
//
export interface IParserInstances {
	[index: string]: AParser;
}
// parse until result
type TParseUntilResult = {
	data: {
		type: string;
		instance: AParser;
	};
	total: number;
};

/**
 * dispatcher: detect the characters and decide which parser should be used.
 * @export
 * @abstract
 * @class Dispatcher
 */
export class Dispatcher {
	protected parsers: IParserList = {};
	protected tagPairs: TStrList = [];
	protected pairHash: TObj<string> = {};
	protected readonly splitor: string = confSplitor;
	protected instances: IParserInstances = {};
	/**
   * add all parsers
   * @param {string} name
   * @param {ParserConfig} config
   * @param {()=>void} parse
   * @returns {(never|void)}
   * @memberof Dispatcher
   */
	public addParser(
		name: string,
		config: IParserConfig,
		parse: () => void,
		setting?: TObj,
	): never | void {
		const { startTag, endTag, separator, pattern } = config;
		const { splitor } = this;
		// the parses's separator can't equal to the root parser's splitor
		if (separator === splitor) {
			return this.halt(
				`the parser of "${name}" can not set '${splitor}' as separator.`,
			);
		}
		// the parser'name is repeated
		if (hasOwn(this.parsers, name)) {
			return this.halt(`the parser of "${name}" has existed.`);
		}
		// no start tag,can't go on the parsing.
		if (startTag.length === 0) {
			return this.halt(`the parser of "${name}"'s startTag can not be empty. `);
		}
		// the start tag or end tag contains special character
		if (/(\\|:|\s)/.test(startTag.concat(endTag).join(""))) {
			const char = RegExp.$1;
			return this.halt(
				`the parser of "${name}" contains special char (${char})`,
			);
		}
		// use the rule, make the pair
		let rule = config.rule;
		const pairs: TStrList = [];
		const hasRule = endTag.length === 0 && (rule instanceof RegExp);
		if (!hasRule) {
			const sortFn = (a: string, b: string) => (b.length > a.length ? 1 : -1);
			startTag.sort(sortFn);
			endTag.sort(sortFn);
		}
		const startRuleSegs: TStrList = [];
		const endRuleSegs: TStrList = [];
		startTag.map((start) => {
			if (!hasRule) {
				startRuleSegs.push(encodeRegexpChars(start));
			}
			if (endTag.length) {
				endTag.map((end) => {
					pairs.push(start + splitor + end);
					if (!hasRule) {
						endRuleSegs.push(encodeRegexpChars(end));
					}
				});
			} else {
				pairs.push(start);
			}
		});
		// check if the pair exists
		for (let i = 0, j = pairs.length; i < j; i++) {
			const cur = pairs[i];
			if (this.tagPairs.indexOf(cur) > -1) {
				const pair = cur.split(splitor);
				return this.halt(
					`the parser of "${name}"'s start tag "${pair[0]}" and end tag "${pair[
						1
					]}" has existed.`,
				);
			} else {
				this.pairHash[cur] = name;
			}
		}
		// build rule
		if (!hasRule) {
			const hasEnd = endTag.length;
			const endWith = `(?=${encodeSplitor}|$)`;
			const startWith = `(?:${startRuleSegs.join("|")})`;
			if (hasEnd) {
				const endFilter = endRuleSegs.join("|");
				rule = new RegExp(
					`^${startWith}(?:\\\\.|[^\\\\](?!${endFilter})|[^\\\\])+?(?:${endFilter}${endWith})`,
				);
			} else {
				rule = new RegExp(`^${startWith}(?:\\\\.|[^\\\\${splitor}])+?${endWith}`);
			}
		}
		// make sure startTag and endTag combine is unique, and the pair matched max is in the start.
		this.tagPairs = this.tagPairs.concat(pairs).sort((a, b) => {
			return a.length - b.length;
		});
		// create a new parser
		this.parsers[name] = class extends AParser {
			public static readonly startTag: TStrList = startTag;
			public static readonly endTag: TStrList = endTag;
			public static readonly separator: string = separator || "";
			public static readonly splitor: string = splitor;
			public static readonly rule: RegExp = rule;
			public static readonly pattern: RegExp | null = pattern || null;
			constructor() {
				super();
				if (setting) {
					this.setting = Object.assign(this.setting, setting);
				}
			}
			public parse() {
				return parse.call(this);
			}
		};
	}
	/**
   *
   * @param result
   * @param errorIndex
   * @returns
   */
	private makeWrapperData(result: TObj<TObj>, errorIndex: number): TObj<TObj> {
		class Wrapper {
			constructor(public readonly errorIndex: number) {}
		}
		Object.assign(Wrapper.prototype, result);
		return new Wrapper(errorIndex) as unknown as TObj<TObj>;
	}
	/**
   * dispatcher parse all the code
   * @param {string} code
   * @memberof Dispatcher
   */
	public parse(
		code: string,
		options: {
			mockit?: Mockit;
			greedy?: boolean;
		} = {},
	): TObj<TObj> | never {
		const len = code.length;
		const { splitor } = this;
		const { mockit, greedy } = options;
		let index = 0;
		let curCode = code;
		const exists: TObj = {};
		const result: TObj<TObj> = {};
		while (index < len) {
			let res;
			if (greedy) {
				// when set greedy
				// return a wrapper data
				try {
					res = this.parseUntilFind(curCode);
				} catch (e) {
					return this.makeWrapperData(result, index);
				}
			} else {
				res = this.parseUntilFind(curCode);
			}
			const { data, total } = res;
			index += total;
			if (index < len && splitor !== code.charAt(index)) {
				throw new Error(
					`unexpect splitor of "${code.slice(
						index,
					)}",expect to be started with splitor "${splitor}"`,
				);
			} else {
				curCode = curCode.slice(total + 1);
				index += 1;
			}
			const { instance, type } = data;
			if (exists[type] && instance.setting.frozen) {
				throw new Error(
					`the config of "${type}" (${instance.code}) can not be set again.`,
				);
			} else {
				if (mockit) {
					const { constrName, allowAttrs, baseType } = mockit.getStaticProps();
					// when no base type, check the allow attrs
					if (!(baseType || allowAttrs.includes(type))) {
						switch (type) {
							case "$config":
								throw new Error(
									`the data type "${constrName}" are not allowed to use configuration when parsing '${code}', please check if you have forget to set the type's field "configOptions"`,
								);
							default:
								throw new Error(
									`the data type "${constrName}" are not allowed to use '${type}' data attribute when parsing '${code}'`,
								);
						}
					}
				}
				const curResult = instance.parse() as TObj;
				if (isArray(curResult)) {
					result[type] = curResult;
				} else if (typeof curResult === "object") {
					result[type] = {
						...(result[type] || {}),
						...curResult,
					};
				}
				exists[type] = true;
			}
		}
		return result;
	}
	/**
   * get a parser's instance by name
   * @protected
   * @param {string} name
   * @returns
   * @memberof Dispatcher
   */
	protected getInstance(name: string): AParser {
		// if (this.instances[name]) {
		//   return this.instances[name].init();
		// }
		return new this.parsers[name]();
	}
	/**
   *
   *
   * @protected
   * @param {string} context
   * @returns
   * @memberof Dispatcher
   */
	protected parseUntilFind(context: string): TParseUntilResult | never {
		if (context === "") {
			throw new Error("the context is empty");
		}
		const { tagPairs, pairHash, splitor, parsers } = this;
		const exactMatched: TStrList = [];
		const error = `can not parse context "${context}",no parser matched.`;
		let allMatched: TStrList = [];
		let startIndex = 0;
		let sub = "";
		let result;
		do {
			const cur = context.charAt(startIndex++);
			sub += cur;
			const total = sub.length;
			let isExactFind = false;
			allMatched = tagPairs.filter((pair) => {
				const flag = pair.indexOf(sub) === 0;
				if (flag && (pair === sub || pair.charAt(total) === splitor)) {
					isExactFind = true;
					exactMatched.push(pair);
				}
				return flag;
			});
			if (allMatched.length === 1) {
				if (!isExactFind) {
					const [pair] = allMatched;
					const index = pair.indexOf(splitor);
					const find = index > 0 ? pair.slice(0, index) : pair;
					if (context.indexOf(find) === 0) {
						exactMatched.push(pair);
					}
				}
				break;
			}
		} while (allMatched.length);
		let len = exactMatched.length;
		if (len) {
			const everTested: TObj<boolean> = {};
			const tryTypes: TStrList = [];
			while (len--) {
				const pair = exactMatched[len];
				const type = pairHash[pair];
				if (everTested[type]) {
					continue;
				}
				let match = null;
				const parser = parsers[type];
				const { rule, separator } = parser;
				tryTypes.push(type);
				if ((match = context.match(rule))) {
					if (separator && match[0].slice(-1) === separator) {
						throw new Error(
							`no need separator "${separator}" in type "${type}" of code "${context}"`,
						);
					}
					const instance = this.getInstance(type);
					const [start, end] = pair.split(splitor);
					const [param] = match;
					try {
						instance.parseCode(param, {
							start,
							end: end || "",
						});
						result = {
							data: {
								type,
								instance,
							},
							total: param.length,
						};
						break;
					} catch (e) {
						// ignore
						everTested[type] = true;
					}
				}
			}
			if (result) {
				return result;
			} else {
				throw new Error(`${error}[tried types:${tryTypes.join(",")}]`);
			}
		} else {
			throw new Error(error);
		}
	}
	/**
   * @protected
   * @param {string} err
   * @returns {never}
   * @memberof Dispatcher
   */
	protected halt(err: string): never {
		throw new Error(err);
	}
}
