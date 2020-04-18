// 发布阶段插件 。开发阶段需要 console
const prodPlugin = [];
if (process.env.NODE_ENv === 'production') {
  prodPlugin.push('transform-remove-console');
}

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    ...prodPlugin
  ]
};
