var path = require('path')
var UglifyJSPlugin = require('uglifyjs-webpack-plugin'); // плагин минимизации
 
module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),    // устанавливаем путь к сборке
    publicPath: '/dist/',                       // устанавливаем публичный путь, по которому файл будет доступен
    filename: 'build.js'                // устанавливаем имя файла сборки
  },
  module: {                     // добавляем модуль vue-loader для загрузки компонентов
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin()
  ]
}