# Changelog

Suchjs add changelog since `v1.0.0`.

## [v3.1.0] - 2022-03-27

### Added

- `:date` type add config option `now` to allowed you to change the base date of the relative date.
- Add `dynamics` config options for `such instance`, now you can change the fields's config dynamic by other depend field's value, it help you to fake the data more exactly as you want.
- Add `AssignType` for such instance's `assign` method, so you can assign a variable with different types for different use cases.

## [v3.0.6] - 2022-03-02

### Changed

- [break change] Change the `Such` instance's `store` from a property to a method, now you should use this new method to get the data in `store`, and a new method `clearStore` is added to allow you clear the store's data.

## [v3.0.4] - 2022-03-01

### Added

- Add the `params` config for `instanceOptions`, it allowed you to override the mockit's `$config` and `$length` parameter, so you can generate the data more exactly.

### Changed

- [break change] Now config not support a regexp literal `/xxx/xx`, but support expression without whitespaces `a*1+2`.

- [break change] The `config` field in `options` of the generate methods's first parameter has renamed to `key` to make the meaning more clear.

## [v3.0.3] - 2022-02-27

### Added

- Add the `clear` method for `store` object, it's necessary for reloading the such config.

- Add more types for server's config. see the [`such-cli`](https://github.com/suchjs/such-cli) README.

## [v3.0.2] - 2022-02-26

### Fixed

- Fix the data files such as `json` and `dict` files, use a cache missing the namespace. Now it will search the file from it's own namespace also the global namespace.

## [v3.0.1] - 2022-02-26

### Changed

- [break change] in the template literal string you need use `//${0}` instead of `/${0}`, with two slashs as a path to reference the data type appeared in template.

- [break change] now in the mockit's `generate` method, the `template` field in `options` now is removed and mounted in the `options`'s `mocker` field.

- Now you can reference the data type out of the template like this `/template/${0}`.

- Fix the `getPathInfo` get a wrong path when the path begin with `./` in deprecated version `v3.0.0`

### Fixed

- Fix the `cascader` and `dict` type in node is defined after `loadConf`, so you can't define a new type base on them, now fixed it.

- Fix when check the data attribute if is enable only check the `allowAttrs` of current type, that may cause an unexpected error because the current type may inherit from another type. Now fix it by also check from the inherited base type.

## [v2.2.3] - 2022-02-23

### Changed

- Change the method `loadExtend` of such class ignore repeated `extends` items thoes have resolved by the global Such instance.

## [v2.2.1] & [v2.2.2] - 2022-02-22

### Added

- Added the server config types for such-cli command `such serve`.

## [v2.2.0] - 2022-02-19

### Fixed

- Fix the type use a function by `@fn(data)` lost the assigned `data`'s parameter.

- Fix some date formats in `:date` type lost `this` what need reference the `Date` object.

- Fix the user defined type base on template type may also cause an error because can't find the `$template` because it's not initialized.

### Changed

- Change `loadData` load the config file by checking the `process.env.SUCH_ROOT` env variable firstly. It's useful for the library's tests in node environment and in `such-cli` command line tool.

### Added

- More tests for uncover codes, remove unnecessary codes.

## [v2.1.8] - 2022-02-15

### Fixed

- Fix the `Such.as` call the extended types multiple times may lost the `instance` property because the `instance` was created in `init` method, but the `init` method only call once.

## [v2.1.7] - 2022-02-09

### Fixed

- Fix the extend `:numeric` type's wrong `$size` config.

### Changed

- Now `:cascader` type in browser, the top level field just need the `data` config, the `root` config is not required anymore.

## [v2.1.5] - 2022-01-22

### Added

- Fix wrong building deprecated version `v2.1.4`.

## [v2.1.4] - 2022-01-22 [deprecated]

### Added

- Add support for nodejs load config file in `type: "module"` package.

## [v2.1.3] - 2022-01-22

### Added

- Add support for nodejs `esm` module.

## [v2.1.2] - 2022-01-19

### Added

- Add generic type for `.instance()` and `.as()` methods, so if you build an instance like this `.instance<string>()`, `const result = instance.a()` then result is a `string` type, the same for the `as` method, e.g. `as<string>()`.

### Changed

- In nodejs environment, if you used a `.json` file as the mock template, please use `asc` method instead of `as` method, so keep the `as` method no need to make a special logic to treat that. `asc` as from file code, also means `async`.

## [v2.1.1] - 2022-01-14

### Fixed

- Fix the ts file import path error.

## [v2.1.0] - 2022-01-13 [deprecated]

### Added

- Add more recommend url types: `domain`、`tld`、`protocol`、`ipv4`、`ipv6`、`ip`

- Add more recommend character types: `alpha`、`numeric`、`alphaNumeric`

- Now `types` in config file support `enum` and `template` types.

### Fixed

- Fix `config` parser `#[]` doesn't support keys with number characters, and fix the key-value like `#[a=""]` got a empty string value instead of a wrong boolean value.

- Fix the `typo` named capture group name `ltd` -> `tld` in `url` and `email` type, this is a breakchange.

- Fix the `regexp` type's `namedGroupConf` doesn't make sence because the upgrade changes of the dependecy package `reregexp`.

- Upgrade the eslint packages in project.

## [v2.0.2] - 2021-10-11

### NPM

Hit the npm incident: [report](https://status.npmjs.org/incidents/wy4002vc8ryc), this version is not updated correctly, update to version v2.0.2.

### Fixed

Fix the "process.env" is not defined in browser when import the package by "npm install".

## [v2.0.0] - 2021-08-31

### Added

- Export a new method named `createNsSuch(namespace: string)`, so you can use it to get a such instance with namespace, then the store data such as defined types, alias names, assigned variables and functions are all in it's own namespace, instances with different namespaces can't access to visit each other's data unless they export the data to global by using methods such as `setExportType`, `setExportVar`, `setExportFn`, etc.

- Now the `define` method allow define type base on `template` literal string and enum data.

- Allowed set keys config of `index` for enum types.

### Changed

- Breaking Change: Now the `Such` object is an instance by calling `createNsSuch` with root namespace, the methods such as `define`, `alias`, `template` and other methods that used to be static methods of `Such` now become to be methods of a `Such` instance.

### Fixed

- Fix the default handle of the data attribute `$config`, `$func` do not trigger correctly.

- Fix the `define` method's parameter of `baseType` not cover the alias names.

### Fixed

## [v1.2.4] - 2021-08-15

### Added

- Add `index` config for the keys of the instance options, so you can use a enum values and get an exactly value by set it.

### Changed

- Change the `checkKeys()` method also return `oneOf`,`alwaysArray` config of the field.

## [v1.2.3] - 2021-08-12

### Changed

- Add the `checkKeys()` method, so every time you called the `a()` method with an instance options with keys will trigger a `check`, all the keys config will be strictly checked one by one.

## [v1.2.2] - 2021-08-12

### Changed

- Add the `exist` to the path value in the instaceOptions keys, so you need use `exist` if the field is optional and also has a count.

### Added

- Add `keys()` method for such instance, so you can get the path of keys which has an `optional` or count `min` and `max` config.

## [v1.2.1] - 2021-08-9

### Changed

- Check the instanceOptions parameter more strictly in the method `a(instanceOptions)`, wrong `min` and `max` value will cause an error.

## [v1.2.0] - 2021-08-9

### Added

- Add the keys config options for the such instance's method `a(instanceOptions: IAInstanceOptions)`, so you can across the options to control thoes fields are optional appear or not, and narrow thoes array fields has a range length to a small range length or a specified length.

### Changed

- Remove the `browser.ts` from the `.npmignore`, now in browser you can install the package and import from `suchjs/lib/browser` to get suchjs as a module.

## [v1.1.2] - 2021-08-3

### Added

- Add syntax like `<name>:data-type` in template literal, so the `:ref` type can use `&/${name}` to reference the named data type's value.

## [v1.1.1] - 2021-08-1

### Fixed

- Fix the `template literal` type can't use `:ref` type correctly.

### Changed

- Change the `path` parser, now allow special characters such as `,` , `:` , `/` etc. use a translate slash to escape the path name.

- The `:ref` data type's path `data attribute` will cause an error if the path is not exists in currently.

### Added

- The `:ref` data type in `template literal` type now can use `/${0}` (format like `/${number}`) to reference the inner data type's generated value.

## [v1.1.0] - 2021-08-1

### Added

- Add `Such.template` static method for generating `template literal` string.

- Add `ToTemplete` mockit, so you can use `Such.as(":::abc")` to call the `Such.template` method for generating.
