function generateRandomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length -1)];
    return result;
}

console.log(generateRandomString(6, '123456789abcdefghijklmnopqrstuv'));