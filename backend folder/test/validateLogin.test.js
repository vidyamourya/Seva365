const validateLogin = require('../utils/validateLogin');

test('Valid login', () => {
  const result = validateLogin("test@gmail.com", "123456");
  expect(result).toBe(true);
});

test('Invalid login', () => {
  const result = validateLogin("wrong@gmail.com", "wrong");
  expect(result).toBe(false);
});

test('Empty input', () => {
  const result = validateLogin("", "");
  expect(result).toBe(false);
});