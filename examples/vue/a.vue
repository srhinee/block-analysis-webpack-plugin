<template lang="pug">
	.container
		img(:src="'./img.png'")
		child
</template>

<script>
import child from './b.vue'
export default {
	components: {child},
	name: 'index',
	data () {
		return {text:'vue'}
	},
	methods: {},
}
</script>

<style scoped lang="less">
.a {
	color: #90a1f0;
}
</style>
