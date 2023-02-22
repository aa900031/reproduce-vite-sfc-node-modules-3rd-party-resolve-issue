import { inject, provide } from 'vue-demi'

const KEY = Symbol('foo')

export function useFoo(message) {
	return provide(KEY, message)
}

export function useFooContext() {
	return inject(KEY)
}
