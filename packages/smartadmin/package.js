Package.describe({
  summary: 'SmartAdmin, with JS and CSS files, assembled by Calix Inc.',
  version: '1.4.0'
});

Package.on_use(function(api) {
  api.use('jquery', 'client');
  api.use('iron:router', 'client');

  // -- bootstrap3 - customized
  api.add_files('bootstrap3/bootstrap.css', 'client');
  api.addAssets('bootstrap3/fonts/glyphicons-halflings-regular.eot', 'client');
  api.addAssets('bootstrap3/fonts/glyphicons-halflings-regular.ttf', 'client');
  api.addAssets('bootstrap3/fonts/glyphicons-halflings-regular.svg', 'client');
  api.addAssets('bootstrap3/fonts/glyphicons-halflings-regular.woff', 'client');

  // -- css
  api.add_files('css/smartadmin-production.css', 'client');
  api.add_files('css/smartadmin-skins.css', 'client');

  // -- js
  api.add_files('js/libs/jquery-ui-1.10.4.js', 'client');

  api.add_files('bootstrap3/bootstrap.js', 'client');
  // <!-- JS TOUCH : include this plugin for mobile drag / drop touch events-->
  api.add_files('js/plugin/jquery-touch/jquery.ui.touch-punch.js', 'client');
  // <!-- CUSTOM NOTIFICATION -->
  api.add_files('js/notification/SmartNotification.js', 'client');
  // <!-- JARVIS WIDGETS -->
  api.add_files('js/smartwidgets/jarvis.widget.js', 'client');
  // <!-- EASY PIE CHARTS -->
  api.add_files('js/plugin/easy-pie-chart/jquery.easy-pie-chart.js', 'client');
  // <!-- SPARKLINES -->
  api.add_files('js/plugin/sparkline/jquery.sparkline.js', 'client');
  // <!-- JQUERY VALIDATE -->
  api.add_files('js/plugin/jquery-validate/jquery.validate.js', 'client');
  // <!-- JQUERY MASKED INPUT -->
  api.add_files('js/plugin/masked-input/jquery.maskedinput.js', 'client');
  // <!-- JQUERY SELECT2 INPUT -->
  api.add_files('js/plugin/select2/select2.js', 'client');
  // <!-- JQUERY UI + Bootstrap Slider -->
  // Conflict with jQuery UI's slider
  // api.add_files('js/plugin/bootstrap-slider/bootstrap-slider.js', 'client');
  // <!-- browser msie issue fix -->
  api.add_files('js/plugin/msie-fix/jquery.mb.browser.js', 'client');
  // <!-- FastClick: For mobile devices: you can disable this in app.js -->
  api.add_files('js/plugin/fastclick/fastclick.js', 'client');
  api.add_files('js/plugin/bootstrapvalidator-0.5.2/bootstrapValidator.js', 'client');

  api.add_files('js/plugin/datatables/jquery.dataTables.js', 'client');

  api.add_files('js/plugin/bootstrap-wizard/jquery.bootstrap.wizard.js', 'client');

  api.add_files('js/plugin/flot/jquery.flot.cust.js', 'client');
  api.add_files('js/plugin/flot/jquery.flot.fillbetween.js', 'client');
  api.add_files('js/plugin/flot/jquery.flot.pie.js', 'client');

  api.add_files('js/jquery-resize.js', 'client');

  api.add_files('js/app.js', 'client');
  api.add_files('js/sxa.js', 'client');

  // -- export
  api.export('SmartAdmin', 'client');


  // -- img
  api.addAssets('img/clear.png', 'client');
  api.addAssets('img/ajax-loader.gif', 'client');
  api.addAssets('img/jcrop/Jcrop.gif', 'client');
  api.addAssets('img/saturation.png', 'client');
  api.addAssets('img/dropzone/spritemap@2x.png', 'client');
  api.addAssets('img/dropzone/spritemap.png', 'client');
  api.addAssets('img/flags/flags.png', 'client');
  api.addAssets('img/gradient/login.png', 'client');
  api.addAssets('img/loading.gif', 'client');
  api.addAssets('img/jqueryui/ui-bg_glass_75_dadada_1x400.png', 'client');
  api.addAssets('img/jqueryui/ui-icons_555555_256x240.png', 'client');
  api.addAssets('img/jqueryui/ui-bg_glass_75_ffffff_1x400.png', 'client');
  api.addAssets('img/jqueryui/ui-icons_cd0a0a_256x240.png', 'client');
  api.addAssets('img/jqueryui/ui-icons_f6cf3b_256x240.png', 'client');
  api.addAssets('img/jqueryui/ui-bg_flat_0_aaaaaa_40x100.png', 'client');
  api.addAssets('img/jqueryui/ui-icons_ffffff_256x240.png', 'client');
  api.addAssets('img/jqueryui/ui-icons_888888_256x240.png', 'client');
  api.addAssets('img/jqueryui/ui-bg_glass_75_e6e6e6_1x400.png', 'client');
  api.addAssets('img/jqueryui/ui-bg_glass_65_ffffff_1x400.png', 'client');
  api.addAssets('img/jqueryui/ui-bg_highlight-soft_75_cccccc_1x100.png', 'client');
  api.addAssets('img/jqueryui/ui-icons_2e83ff_256x240.png', 'client');
  api.addAssets('img/jqueryui/ui-bg_glass_55_fbf9ee_1x400.png', 'client');
  api.addAssets('img/jqueryui/ui-icons_222222_256x240.png', 'client');
  api.addAssets('img/jqueryui/ui-icons_454545_256x240.png', 'client');
  api.addAssets('img/jqueryui/ui-icons_f0ad4e_256x240.png', 'client');
  api.addAssets('img/jqueryui/ui-bg_inset-soft_95_fef1ec_1x100.png', 'client');
  api.addAssets('img/jqueryui/ui-bg_flat_0_999999_40x100.png', 'client');
  api.addAssets('img/jqueryui/ui-icons_428bca_256x240.png', 'client');
  api.addAssets('img/jqueryui/ui-icons_999999_256x240.png', 'client');
  api.addAssets('img/alpha.png', 'client');
  api.addAssets('img/hue.png', 'client');
  api.addAssets('img/pattern/overlay-pattern.png', 'client');
  api.addAssets('img/mybg.png', 'client');
  api.addAssets('img/select2-spinner.gif', 'client');
  api.addAssets('img/voicecommand/active-btn.gif', 'client');

  // Less variables
  //api.add_files('import/variables.import.less', 'client');

  // --------------------------------------------------------------------------
  // 3rd Party Plugins / Libraries'

  // PNotify http://sciactive.com/pnotify
  api.add_files('js/plugin/pnotify/pnotify.all.js', 'client');
  api.add_files('js/plugin/pnotify/pnotify.all.css', 'client');
  api.export('PNotify', 'client');

});
