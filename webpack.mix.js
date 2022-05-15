let mix = require('laravel-mix');

mix
  .setPublicPath('./')
  .sass('assets/sass/app.scss', 'dist/css')
  .js('assets/js/background.js', 'dist/js')
  .js('assets/js/app.js', 'dist/js')
  .vue()
  .copy('assets/images/', 'dist/images')
  .options({
    processCssUrls: false,
  });
