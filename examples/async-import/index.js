//amd
require ([`./amd.js`], res => console.log (res))
//ensure
require.ensure ('./lib/c.js', c => console.log (c),'c-bundle')
//context
import async from './async.js'

async ('a')