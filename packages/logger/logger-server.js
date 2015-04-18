var Winston = Npm.require('winston');
var Path = Npm.require('path');
var Fs = Npm.require('fs');
var Util = Npm.require('util');

var cwd = process.cwd();
var dirname = Path.join(cwd, 'logs');

// Meteor Logger
var logInConsole = function(level, msg) {
  console.log(EJSON.stringify({
    file: level.toUpperCase(),
    time: new Date(),
    level: level,
    message: msg
  }));
};
var MeteorLogger = Winston.transports.MeteorLogger = function(options) {
  Winston.Transport.call(this, options);
  this.name = 'MeteorLogger';
};
Util.inherits(MeteorLogger, Winston.Transport);

MeteorLogger.prototype.log = function(level, msg, meta, callback) {
  if (!_.isString(level) || level.length == 0) level = 'debug';
  if (level == 'silly') level = 'debug';
  if (level == 'verbose') level = 'info';
  logInConsole(level, msg);

  callback(null, true);
};

// Global Logger
if (!Fs.existsSync(dirname)) {
  Fs.mkdirSync(dirname);
}
logInConsole('warn', 'Winston Logger > ' + dirname);
Logger = new(Winston.Logger)({
  transports: [
    new MeteorLogger({
      level: 'debug'
    }),
    new Winston.transports.DailyRotateFile({
      level: 'debug',
      maxsize: 20000000,
      datePattern: '.yyyy-MM-dd',
      filename: Path.join(dirname, 'cc-app.log')
    })
  ]
});
