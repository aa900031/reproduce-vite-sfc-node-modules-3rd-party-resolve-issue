<script setup>
import { Wrapper, Foo } from 'bar'
</script>

<template>
	<h1>Please check DevTools console!<br>Should print `Error: Not in the Foo context`</h1>
	<Wrapper>
		<Foo />
	</Wrapper>
</template>
