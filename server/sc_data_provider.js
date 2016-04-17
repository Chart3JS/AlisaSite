var SC = require("node-soundcloud");
const SC_CREDENTIALS = {
  id: '24e4f5a6a6eb2b39a34bb53c60270526',
  secret: '4ed02ac34cfd8f03aa9f091e0479cc21',
  uri: ''
};
module.exports = {
  init: function() {
    SC.init(SC_CREDENTIALS);
    //debugger;
  }
};
