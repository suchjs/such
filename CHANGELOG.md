# Changelog

Suchjs add changelog since `v1.0.0`.


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




