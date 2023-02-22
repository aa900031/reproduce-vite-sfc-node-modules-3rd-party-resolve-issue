<script>
import { useFoo } from 'foo'

export default {
	setup() {
		useFoo('wrapper')
	}
}
</script>

<template>
	<div>
		<slot></slot>
	</div>
</template>
