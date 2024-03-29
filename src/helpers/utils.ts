import { TFunc, TObj, TStrList, TMultiStr, TPath } from "../types/common";
import { TFieldPath } from "./pathmap";
import { IPPPathItem } from "../types/parser";
import { Mocker } from "../core/such";
import { TMParams } from "../types/mockit";

/**
 * hasOwn
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hasOwn = (obj: TObj<any>, key: string): boolean =>
	Object.prototype.hasOwnProperty.call(obj, key);

/**
 *  setPrototypeOf: https://github.com/wesleytodd/setprototypeof
 *
 */
const setPrototypeOf = (() => {
	if (Object.setPrototypeOf) {
		return (clone: TObj, proto: TObj) => {
			Object.setPrototypeOf(clone, proto);
		};
	} else if ({ __proto__: [] } instanceof Array) {
		return (clone: TObj, proto: TObj) => {
			clone.__proto__ = proto;
		};
	} else {
		return (clone: TObj, proto: TObj) => {
			for (const prop in proto) {
				if (!hasOwn(clone, prop)) {
					clone[prop] = proto[prop];
				}
			}
		};
	}
})();

/*
 * re export strtotime/dateformat from dateformat
 */
export { strtotime, dateformat } from "./dateformat";

/**
 *
 * @param target [unkown]
 * @returns [string] the type of the target
 */
export const typeOf = (target: unknown): string => {
	return Object.prototype.toString.call(target).slice(8, -1);
};

/**
 *
 * @param target [unkown]
 * @returns [boolean] check if the target is a function
 */
export const isFn = <T = TFunc>(target: unknown): target is T =>
	typeof target === "function";

/**
 *
 * @param target [unkown]
 * @returns [boolean] check if the target is an array
 */
export const isArray = <T = unknown[]>(target: unknown): target is T => {
	return Array.isArray(target);
};

/**
 *
 * @param target [unkown]
 * @returns [boolean] check if the target is a plain object
 */
export const isObject = (target: unknown): target is TObj =>
	typeOf(target) === "Object";

/**
 *
 * @param target [unkown]
 * @returns [boolean] check if the target is a plain object and not empty
 */
export const isNoEmptyObject = (target: unknown): boolean => {
	return isObject(target) && Object.keys(target).length > 0;
};

/**
 * 
 * @param obj [TObj]
 */
export const setObjectEmpty = (obj: TObj) => {
	for (const key of Object.getOwnPropertyNames(obj)) {
		delete obj[key];
	}
};

/**
 * 
 * @param arr [Array<unknown>]
 */
export const setArrayEmtpy = (arr: unknown[]) => {
	arr.length = 0;
};

/**
 *
 * @param min [number] the min of the random number
 * @param max [number] the max of the random number
 * @returns [number] a random number between min and max
 */
export const makeRandom = (min: number, max: number): number => {
	if (min === max) {
		return min;
	}
	return min + Math.floor(Math.random() * (max + 1 - min));
};

/**
 *
 * @param begin [character] the begin character
 * @param end [character] the end character
 * @param args [characters] more character begin and end pairs
 * @returns [character[]] all characters between begin and end
 */
export const makeStrRangeList = (
	begin?: string,
	end?: string,
	...args: string[]
): string[] => {
	if (!(begin && end)) {
		return [];
	}
	const min = begin.charCodeAt(0);
	const max = end.charCodeAt(0);
	const results = [];
	let cur = min;
	while (cur <= max) {
		results.push(String.fromCharCode(cur++));
	}
	return args.length > 0 && (args.length % 2) === 0 ? results.concat(
		makeStrRangeList(...args),
	) : results;
};

/**
 *
 * @param start [number] the range of the start
 * @param end [number] the range of the end
 * @param step [number] the step of the range
 * @returns number[]
 */
export const range = (start: number, end: number, step = 1): number[] => {
	const length = Math.floor((end - start) / step) + 1;
	return Array.from(
		{
			length,
		},
		(_: undefined, index: number) => {
			return start + (index * step);
		},
	);
};

/**
 *
 * @returns [boolean] return random true or false
 */
export const isOptional = (): boolean => {
	return Math.random() >= 0.5;
};

/**
 *
 * @param target [string] the string need be capitalized
 * @returns [string]
 */
export const capitalize = (target: string): string => {
	return target && target.length ? target.charAt(
		0,
	).toUpperCase() + target.slice(1) : "";
};

/**
 *
 * @param target [string]
 * @returns [string] translate back the translate characters
 */
export const decodeTrans = (target: string): string => {
	return target.replace(/\\(.)/g, "$1");
};

/**
 *
 * @param exp [string] a javascript expression
 * @returns [unkown|never]
 */
export const getExp = (exp: string): unknown | never => {
	const fn = new Function("", `return ${exp}`);
	try {
		return fn();
	} catch (e) {
		throw new Error(`wrong expression of "${exp}".reason:${e}`);
	}
};

/**
 *
 * @param args [unkown[]]
 * @returns [unkown|never]
 */
export const getExpValue = (...args: unknown[]): unknown | never => {
	const param = "__$__";
	const value = args.pop();
	let cur;
	while ((cur = args.shift()) !== undefined) {
		try {
			return new Function(param, `return ${param}.${value}`)(cur);
		} catch (e) {
			// continue
		}
	}
};

function deepCopyHandle<T>(target: T, copy: T): void {
	let keys: Array<keyof T> = [];
	let tryClass = false;
	if (isObject(copy)) {
		keys = Object.keys(copy) as Array<keyof T>;
		tryClass = copy.constructor !== Object;
	} else if (isArray(copy)) {
		keys = range(0, copy.length - 1) as Array<keyof T>;
	}
	keys.map((key) => {
		const from = copy[key];
		const to = target[key];
		const fromType = typeOf(from);
		const toType = typeOf(to);
		if (fromType === "Object" || fromType === "Array") {
			target[key] = (
				toType === fromType
					? target[key]
					: fromType === "Object"
						? {}
						: []
			) as typeof from;
			deepCopy(target[key], from);
		} else {
			target[key] = from;
		}
	});
	if (tryClass) {
		setPrototypeOf(target as unknown as TObj, copy.constructor.prototype);
	}
}

/**
 *
 * @param target [any]
 * @param args [unkown[]]
 * @returns [unkown] deep copy the nest of args into target
 */
export const deepCopy = <T = unknown>(target: T, ...args: unknown[]): T => {
	let isObj = false;
	let isArr = false;
	if ((isObj = isObject(target)) || (isArr = isArray(target))) {
		for (let i = 0, j = args.length; i < j; i++) {
			const copy = args[i];
			if ((isObj && isObject(copy)) || (isArr && isArray(copy))) {
				deepCopyHandle(target, copy);
			}
		}
	}
	return target;
};

/**
 *
 * @param obj [object]
 * @param keys [string[]]
 * @returns [object] get the pointed `keys` of the `obj` and remove them from `obj`
 */
export const shiftObj = <T = TObj>(
	obj: T,
	keys: Array<keyof T>,
): Partial<T> => {
	const res: Partial<T> = {};
	keys.forEach((key) => {
		res[key] = obj[key];
		delete obj[key];
	});
	return res;
};

/**
 *
 * @param obj [TObj]
 * @param keys [string[]]
 * @returns get the keys and values from the obj if the key exist
 */
export const pickObj = <T = TObj>(obj: T, keys: Array<keyof T>): Partial<T> => {
	const res: Partial<T> = {};
	keys.map((key: keyof T) => {
		if (hasOwn(obj, key as string)) {
			res[key] = obj[key];
		}
	});
	return res;
};
/**
 *
 * @param first [TFieldPath]
 * @param second [TFieldPath]
 * @returns [boolean] check if two paths has a relation of parent and sub child
 */
export const isRelativePath = (
	first: TFieldPath,
	second: TFieldPath,
): boolean => {
	const len = first.length;
	if (len > second.length) {
		return isRelativePath(second, first);
	}
	let i = 0;
	while (i < len) {
		const cur = first[i].toString();
		const compare = second[i].toString();
		if (cur !== compare) {
			break;
		}
		i++;
	}
	return i === len;
};

/**
 *
 * @param path [TFieldPath]
 * @returns [string] return the path's string value
 */
export const path2str = (path: TFieldPath): string => `/${path.join("/")}`;

/**
 *
 * @param pathname [TPath] the path need be parsed
 * @returns parsed path with segments
 */
export const parsePathSeg = (pathname: TPath = ""): TPath[] => {
	const result: TPath[] = [];
	let isInTranslate = false;
	let seg = "";
	for (let i = 0, total = pathname.length; i < total; i++) {
		const ch = pathname.charAt(i);
		if (isInTranslate) {
			isInTranslate = false;
			seg += ch;
		} else {
			if (ch === "\\") {
				isInTranslate = true;
			} else if (ch === "/") {
				result.push(seg);
				seg = "";
			} else {
				seg += ch;
			}
		}
	}
	if (seg !== "") {
		result.push(seg);
	}
	return result;
};

/**
 *
 * @param item [IPPPathItem]
 * @param mocker [Mocker]
 * @returns
 */
export const getPathInfo = (item: IPPPathItem, mocker: Mocker):
	| TFieldPath
	| never => {
	let lastPath: TFieldPath;
	const { path, template } = mocker;
	const curPath = item.path;
	if (item.relative) {
		if (item.fix) {
			if (!template) {
				throw new Error(
					`wrong path '${item.fullpath}', now only the template type support a fix path begin with '//'`,
				);
			}
			lastPath = path.concat(curPath);
		} else {
			if (path.length < item.depth) {
				// the path not exists
				throw new Error(
					`the path of "${
						lastPath ? `/${lastPath.join("/")}` : item.fullpath
					}" is not exists in the instances.`,
				);
			} else {
				// get the relative path
				lastPath = path.slice(0, -(1 + item.depth)).concat(curPath);
			}
		}
	} else {
		lastPath = curPath;
	}
	if (!item.fix && isRelativePath(path, lastPath)) {
		// the mocker path and the reference path has relation of parent and descendants
		throw new Error(
			`the ref path of "${path.join("/")}" and "${lastPath.join(
				"/",
			)}" is a relative path.`,
		);
	}
	return lastPath;
};

/**
 *
 * @param item [IPPPathItem]
 * @param mocker [Mocker]
 * @returns [Mocker|never] get the reference mocker by path
 */
export const getRefMocker = (item: IPPPathItem, mocker: Mocker):
	| Mocker
	| never => {
	const { root } = mocker;
	const { instances, owner } = root;
	const lastPath = getPathInfo(item, mocker);
	owner.checkIfHasPaths(path2str(lastPath));
	return instances.get(lastPath);
};

/**
 * validators
 */
export const validator = {
	validNumber(type: string, field: string, value: unknown): boolean | never {
		if (typeof value !== "number") {
			throw new Error(
				`the data type '${type}' only accept a '${field}' configuration with number, but got a value of type '${
					typeof value
				}'`,
			);
		}
		return true;
	},
	validInteger(type: string, field: string, value: unknown): boolean | never {
		if (typeof value !== "number") {
			throw new Error(
				`the data type '${type}' only accept a '${field}' configuration with integer number, but got a value of type '${
					typeof value
				}'`,
			);
		} else {
			if ((value % 1) !== 0) {
				throw new Error(
					`the data type '${type}' only accept a '${field}' configuration with integer number, but got a number '${value}'`,
				);
			}
		}
		return true;
	},
};

/**
 *
 * @param data
 * @param values
 * @returns
 */
export const getCascaderValue = <T = string>(data: unknown, values: T[]):
	| unknown
	| never => {
	const len = values.length;
	let i = 0;
	while (i < len) {
		const cur = values[i++];
		if (isObject(data)) {
			data = data[cur as unknown as (keyof typeof data)];
		} else {
			throw new Error(`${values.slice(0, i).join(".")}字段路径没有找到`);
		}
	}
	if (isArray(data)) {
		const index = makeRandom(0, data.length - 1);
		return data[index];
	} else {
		const keys = Object.keys(data);
		const index = makeRandom(0, keys.length - 1);
		return keys[index];
	}
};

/**
 *
 * @param params [TMParams]
 * @param mocker [Mocker]
 * @returns
 */
export const makeCascaderData = (params: TMParams, mocker: Mocker): {
	handle: typeof getCascaderValue;
	lastPath: IPPPathItem;
	values: unknown[];
	$config: typeof params.$config;
} => {
	let { $path = [], $config } = params;
	let lastPath = $path[0];
	let handle = $config.handle as typeof getCascaderValue;
	const values: unknown[] = [];
	// the nested max level < 10
	let loop = 1;
	// loop to get the root mocker
	while (loop++ < 10) {
		// once meet the root or data
		if ($config.root || $config.data) {
			break;
		}
		const refMocker = getRefMocker(lastPath, mocker);
		if (!refMocker) {
			// eslint-disable-next-line no-console
			console.error(
				`the cascader reference the path '${lastPath}' is not exist or generated.`,
			);
			return;
		}
		const { mockit } = refMocker;
		const { params } = mockit;
		$path = params.$path;
		$config = params.$config;
		lastPath = $path && $path[0];
		handle = (handle || $config.handle) as typeof getCascaderValue;
		values.unshift(refMocker.result);
	}
	handle = handle || getCascaderValue;
	return {
		handle,
		lastPath,
		values,
		$config,
	};
};

/**
 *
 * @param params [TMParams]
 * @returns
 */
export const makeDictData = (params: TMParams): (
	(result: TStrList[]) => TMultiStr
) => {
	const { $length } = params;
	const makeOne = (result: TStrList[]): string => {
		const dict = result[makeRandom(0, result.length - 1)];
		return dict[makeRandom(0, dict.length - 1)];
	};
	const makeAll = (result: TStrList[]): TMultiStr => {
		let count = $length ? makeRandom($length.least, $length.most) : 1;
		const one = count === 1;
		const last: TStrList = [];
		while (count--) {
			last.push(makeOne(result));
		}
		return one ? last[0] : last;
	};
	return makeAll;
};
