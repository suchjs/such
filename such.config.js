module.exports = {
  extends: ['such:recommend'],
  config: {
    preload: true,
    suchDir: 'examples/suchas',
    dataDir: 'examples/suchas/data',
    extensions: ['.json', '.txt'],
  },
  types: {
    "province": ["cascader", "&<dataDir>/city.json:#[root=true]"]
  },
  alias: {},
};
