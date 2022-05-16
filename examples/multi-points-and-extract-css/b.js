import mod from './d.js'
export default function add (n1, n2) {
	return n1 + n2
}

export function unused (arr) {
	console.log ('unused', arr)
}

mod (100, 11)
