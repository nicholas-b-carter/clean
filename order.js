const rp = require('request-promise');
const Promise = require('bluebird');

const getRandomInt = (min, max) => (Math.floor((Math.random() * ((max - min) + 1)) + min));

module.exports = {
  create: ({ deliveryDate }) => new Promise((resolve) => {
    rp({
      uri: 'http://hamilton-api.herokuapp.com/orders',
      method: 'POST',
      body: {
        deliveryDate,
        items: [],
        customerId: '123456789',
        orderId: getRandomInt(1000000, 9999999).toString(),
      },
      json: true,
    })
      .then(response => resolve(response));
  }),
};
