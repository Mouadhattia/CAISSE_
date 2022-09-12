var DataTypes = require("sequelize").DataTypes;
var _qr_login_sessions = require("./qr_login_sessions");

function initModels(sequelize) {
  var qr_login_sessions = _qr_login_sessions(sequelize, DataTypes);


  return {
    qr_login_sessions,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
