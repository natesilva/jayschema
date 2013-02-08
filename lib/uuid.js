//
// Basic UUID generator.
//

// ******************************************************************
// generate a V4 UUID
// ******************************************************************
exports.uuid4 = function() {
  var bytes = [];
  var index;

  var min = 0x00, max = 0xFF;
  for (index = 0; index !== 16; ++index) {
    bytes.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  // must be 4X hex
  bytes[6] = bytes[6] & 0x4F | 0x40;

  // must be 8X, 9X, AX, BX
  bytes[8] = bytes[8] & 0xBF | 0x80;

  var result = '';
  for (index = 0; index !== 4; ++ index) {
    result += ('0' + bytes[index].toString(16)).slice(-2);
  }
  result += '-';
  for (index = 4; index !== 6; ++ index) {
    result += ('0' + bytes[index].toString(16)).slice(-2);
  }
  result += '-';
  for (index = 6; index !== 8; ++ index) {
    result += ('0' + bytes[index].toString(16)).slice(-2);
  }
  result += '-';
  for (index = 8; index !== 10; ++ index) {
    result += ('0' + bytes[index].toString(16)).slice(-2);
  }
  result += '-';
  for (index = 10; index !== 16; ++ index) {
    result += ('0' + bytes[index].toString(16)).slice(-2);
  }

  return result;
}
