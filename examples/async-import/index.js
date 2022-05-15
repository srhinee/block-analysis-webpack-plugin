function asyncGet(){
  let l='.js'
  return ()=>import(`./async`+l)
}


const amd = (resolve) => require ([`./amd.js`], resolve)
const amd1 = (resolve) => require ([`./amd.js`], resolve)
