// TODO Workaround for keepalive issue,
// - https://github.com/meteor/meteor/issues/2536
//
// To be removed after it's been resolved
//
process.argv = _.without(process.argv, '--keepalive');
Meteor.startup(function () { console.log("LISTENING"); });
