const stickybits = require('stickybits');

module.exports = function(options){
  window.addEventListener('load', async () => {
    console.log('App started!', options);
    stickybits('.navigation');
  });
};
