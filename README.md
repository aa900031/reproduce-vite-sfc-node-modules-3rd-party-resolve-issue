# Reproduce Vite use Vue SFC in node_modules will be different when resolving 3rd party packages

## Scenario
I have written a package called `bar` which depends on the `foo` package. `bar` provides two components, "Wrapper" and "Foo", and is boundle with [mkdist](https://github.com/unjs/mkdist).

- [Wrapper](packages/bar/Wrapper.vue):
  - Provides an SFC.
  - Uses the "useFoo(name)" function from the `foo` package, which passes the name down using Vue provide.
- [Foo](packages/bar/Foo.mjs):
  - Provides a JS component.
  - Uses the "useFooContext(name)" function from the `foo` package, which obtains the foo context using Vue inject.
  - Throws an error (`Error: Not in the Foo context`) if the foo context is not available.

When `bar` is imported into a Vite Vue project and Wrapper and Foo are used (see [App.vue](./packages/web/src/App.vue) for reference), the foo context cannot be read, resulting throw the error `Error: Not in the Foo context`.

## Problem Analysis

Vite's Dependency Pre-Bundling will bundle `bar` along with `foo`, and you can see that `Symbol("foo")` is already included. However, "Wrapper.vue" is not bundled during pre-bundling but is instead imported as an external file.

`packages/web/node_modules/.vite/deps/bar.js`
```js
// ...

var KEY = Symbol("foo");
function useFooContext() {
  return inject(KEY);
}

var Foo_default = {
  setup() {
    const foo = useFooContext();
    if (!foo)
      throw new Error("Not in the Foo context");
    return () => h("div", `Hi ${foo}`);
  }
};

import { default as default2 } from "/Users/markliang/Developer/reproduce-vite-sfc-node-modules-3rd-party-resolve-issue/node_modules/.pnpm/file+packages+bar+bar-1.0.0.tgz_vue@3.2.47/node_modules/bar/Wrapper.vue";
export {
  Foo_default as Foo,
  default2 as Wrapper
};

// ...
```

When browser requesting the `Wrapper.vue` file from the Vite Dev Server, `@vue/compiler-sfc` is only called to compile it.

However, when using `useFoo` is directly imported from `node_modules/foo`, causing `Symbol('foo')` and the `Foo` component to be used differently, leading to an error thrown by `Foo`.

```js
import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/@fs/Users/zhong666/Developer/reproduce-vite-sfc-node-modules-3rd-party-resolve-issue/node_modules/.pnpm/file+packages+bar+bar-1.0.0.tgz_vue@3.2.47/node_modules/bar/Wrapper.vue");
import { useFoo } from '/@fs/Users/zhong666/Developer/reproduce-vite-sfc-node-modules-3rd-party-resolve-issue/node_modules/.pnpm/file+packages+foo+foo-1.0.0.tgz_vue@3.2.47/node_modules/foo/index.mjs?v=549e1d7f'

const _sfc_main = {
	setup() {
		useFoo('wrapper')
	}
}

import { renderSlot as _renderSlot, openBlock as _openBlock, createElementBlock as _createElementBlock } from "/node_modules/.vite/deps/vue.js?v=97bd849d"

function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("div", null, [
    _renderSlot(_ctx.$slots, "default")
  ]))
}


_sfc_main.__hmrId = "a4b0bd6f"
typeof __VUE_HMR_RUNTIME__ !== 'undefined' && __VUE_HMR_RUNTIME__.createRecord(_sfc_main.__hmrId, _sfc_main)
import.meta.hot.accept(mod => {
  if (!mod) return
  const { default: updated, _rerender_only } = mod
  if (_rerender_only) {
    __VUE_HMR_RUNTIME__.rerender(updated.__hmrId, updated.render)
  } else {
    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated)
  }
})
```


## Start

Create `foo`, `bar` packaged tar.gz file

```
pnpm run bundle
```

Install dependencies

```
pnpm install
```

Run Vite dev server with clean dep pre bundling

```
pnpm dev --force
```

Open the browser http://localhost:5173/ and open DevTools to view the console.
