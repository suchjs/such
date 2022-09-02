import { IPPPath } from "../../types/parser";
import { makeCascaderData } from "../../helpers/utils";
import { getFileCacheData } from "../utils";
import { TSuchInject } from "../../types/instance";
import { TStrList } from "../../types/common";
import Mockit from "../../core/mockit";
import { Such } from "../../core/such";

export default {
	// config options
	configOptions: {
		root: {
			type: Boolean,
			default: false,
		},
		handle: {
			type: Function,
		},
		data: {},
	},
	// init method
	init(): void {
		// cascader value need '$path' data attribute
		// for root node, the $path pointed to the data file or set a config of 'data'
		// for child node, the $path reference to the parent node
		this.addRule("$path", ($path: IPPPath) => {
			if ($path && $path.length !== 1) {
				throw new Error("the cascader type must have an only path or ref.");
			}
		});
	},
	/**
   * generate a cascader value
   * @param options [TSuchReject]
   * @returns [unkown]
   */
	generate(this: Mockit<unknown>, options: TSuchInject, such: Such):
		| unknown
		| never {
		const { mocker } = options;
		const { handle, values, lastPath, $config } = makeCascaderData(
			this.params,
			mocker,
		);
		let data: unknown;
		if ($config?.data) {
			// you can't set both the config data and a file path
			if (lastPath) {
				throw new Error(
					`[${mocker.path.join(
						"/",
					)}]You can't set a cascader type both with a config 'data' and a reference file path:"${lastPath.fullpath}".`,
				);
			}
			// use the config data as the cascader data
			data = $config.data;
		} else {
			data = getFileCacheData(lastPath, such.store("config", "fileCache"));
		}
		return handle(data, values as TStrList);
	},
};
