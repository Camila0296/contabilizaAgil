const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

let number1, number2, result;

Given('que tengo el número {int}', function (number) {
  if (number1 === undefined) {
    number1 = number;
  } else {
    number2 = number;
  }
});

When('los sumo', function () {
  result = number1 + number2;
});

Then('el resultado debe ser {int}', function (expected) {
  expect(result).to.equal(expected);
});
