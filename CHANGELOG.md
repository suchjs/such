# Changelog

Suchjs add changelog since `v1.0.0`.

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
