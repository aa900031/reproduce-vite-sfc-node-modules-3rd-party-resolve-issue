import { h } from 'vue-demi'
import { useFooContext } from 'foo'

export default {
	setup() {
		const foo = useFooContext()
		if (!foo) throw new Error('Not in the Foo context')

		return () => h('div', `Hi ${foo}`)
	}
}
