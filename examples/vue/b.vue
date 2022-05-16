<template lang="pug">
	.b {{text}}
</template>

<script>
import data from './data.txt'
export default {
	name: 'child',
    data(){
		return {text:data}
    },
    methods:{},
}
</script>

<style scoped lang="less">
.b{
	color: #f93516
}
</style>
