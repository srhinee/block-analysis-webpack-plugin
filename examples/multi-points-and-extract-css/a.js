import add from './b.js'
require.context('./style',false,/.css$/)

add(1, 2)

import('./c').then(del => del(1, 2))
export default function (args) {
  return args+'this is a'
}
