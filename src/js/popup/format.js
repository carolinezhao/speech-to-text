/* revise from Web Speech API demo */

export function capitalize(s) {
  var first_char = /\S/;
  return s.replace(first_char, function (m) {
    return m.toUpperCase();
  });
}

export function linebreak(s) {
  var two_line = /\n\n/g;
  var one_line = /\n/g;
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}