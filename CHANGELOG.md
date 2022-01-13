# Changelog

Suchjs add changelog since `v1.0.0`.

## [v2.1.0] - 2022-01-13

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
