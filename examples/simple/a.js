import minus from './b.js'

minus(1, 2)

import(/* webpackChunkName: "c" */'./c').then(division => division(1, 2))
export default function (a,b) {
  return a+b
}
