# CMM version : Boost User Engagement with Exit Intent Detection.

### A composable to show your modal when a user is about to leave the page or another threshold reached.

[Demo](https://vue-exit-intent.netlify.app/)

The very first version of this package created in favor of [this](https://dev.to/nickap/exit-intent-pop-up-how-to-publish-on-npm-vue-3-3bhm) old guide. [Here](https://dev.to/nickap/use-vue-exit-intent-a-vue-composable-to-power-your-exit-intent-content-4hlh) is an updated article regarding the latest version.

# Usage

### Import the composable and show your content according to the value of `isShowing`.

When the exit intent is triggered, a key-value pair (with the current timestamp) is stored in **localStorage**. The timestamp will be re-evaluated according to the given options the next time the user intends to exit your app.

## Add the package

```
npm i vue-exit-intent
```

##### If you are using Vue versions earlier than 2.7, you need to install the @vue/composition-api plugin because Composition API is not supported natively.

## Use the package

```javascript
<sript setup lang="ts">
import { useVueExitIntent } from 'vue-exit-intent'

const { isShowing, close } = useVueExitIntent();
</script>
```

```html
<template>
  <dialog :open="isShowing">
    <p>Exit intent detected!</p>
    <form method="dialog">
      <button value="ok" @click="close()">OK</button>
    </form>
  </dialog>
</template>
```

# Available helpers & Options

If you use all available helpers & some options your code will be like this:

```javascript
const options = {
  repeatAfterDays: 1,
  scrollPercentageToTrigger: 50,
  handleScrollBars: true,
  LSItemKey: 'exit-intent-local-storage-key',
  setupBeforeMount: true
};

const {
  isShowing,
  isAllowedToGetTriggered,
  isUnsubscribed,
  close,
  resetState,
  unsubscribe
} = useVueExitIntent(options);
```

## Helpers

`isShowing`: a reactive boolean ref that tracks whether the exit intent popup is currently visible.  
`isAllowedToGetTriggered`: a reactive boolean ref that tracks whether the exit intent popup is allowed to trigger.  
`isUnsubscribed`: a reactive boolean ref that tracks whether the user has unsubscribed from the exit intent popup.  
`close`: a function that closes the exit intent popup and resets any related states (e.g. the isShowing ref).  
`resetState`: a function that resets all state related to the exit intent popup (e.g. isShowing, isAllowedToGetTriggered, isUnsubscribed).  
`unsubscribe`: a function that unsubscribes the user from the exit intent popup.

## Options

| Key                           | Default Value     | Type    | Required |
| ----------------------------- | ----------------- | ------- | -------- |
| **repeatAfterDays**           | 7                 | number  | false    |
| **scrollPercentageToTrigger** | 0                 | number  | false    |
| **delaySecondsAndTrigger**    | 0                 | number  | false    |
| **triggerOnExitIntent**       | true              | boolean | false    |
| **touchDeviceSensitivity**    | 15                | number  | false    |
| **scrollDebounceMillis**      | 300               | number  | false    |
| **triggerOnPageLoad**         | false             | boolean | false    |
| **handleScrollBars**          | false             | boolean | false    |
| **LSItemKey**                 | 'vue-exit-intent' | string  | false    |
| **setupBeforeMount**          | false             | boolean | false    |
| **inactiveSeconds**           | 0                 | number  | false    |

### Options Description

- **repeatAfterDays**  
  After how many days you want the popup to get triggered again.  
  When a user gets the popup that exact timestamp is stored in localstorage and its taken into account next time the user will visit your page.  
  Giving a zero, the popup will be shown only once! Until the localstrage of the user gets cleared/resets.  
  **Give 0 to disable.**  
  **This one runs a CHECK before show.**

- **scrollPercentageToTrigger**  
  A scroll percentage that if reached by the user, the pop-up will get triggered.  
  **Give 0 to disable.**  
  **This one TRIGGERS the popup.**

- **delaySecondsAndTrigger**  
  Trigger the pop-up after a short delay in seconds, once the page has loaded.  
  **Give 0 to disable.**  
  **This one TRIGGERS the popup.**

- **touchDeviceSensitivity**  
  On touch devices where there is no mouseleave event, the popup will get triggered on fast (touch)scroll up.
  The larger the number you will give, the more sesitive will be the pop-up on touch devices.  
  **Give 0 to disable.**  
  **This one TRIGGERS the popup on touch devices.**

- **triggerOnExitIntent**  
  If false. Mouse out event, and scroll-up-fast for touch devices, will not trigger the pop-up. The user would have to reach delaySecondsAndTrigger or scrollPercentageToTrigger to get the popup.
  If true, your modal pop-up is set to get triggered on user exit-intent.  
  **This one TRIGGERS the popup.**

- **scrollDebounceMillis**  
  Time in milliseconds to debounce user's scrolling

- **triggerOnPageLoad**  
  Show your modal pop-up immediately When a user visits your page.  
  **This one TRIGGERS the popup.**

- **handleScrollBars**  
  Composable will handle the value of: `document.body.style.overflowY`.  
  Will be eather `auto` (when isShowing is `false`), or `hidden` (when isShowing is `true`)

- **LSItemKey**  
  Key of Local Storage item.
  You can use a different key to show multiple pop-ups with different behaviour/content.

- **setupBeforeMount**  
  Determines whether the initialization of the composable occurs during the `onBeforeMount` lifecycle hook instead of the default `onMounted` hook.  
  This options allows you to set up the exit intent before your component is mounted.

- **inactiveSeconds**  
  Delay, in seconds, before activating mouse, touch, and scroll listeners to track user behavior and potentially trigger the popup after an exit intent is detected (mouse leaves the viewport, scroll percentage reached, or fast touch scroll up). This delay helps prevent the immediate display of the popup, ensuring it only appears if the user wants to leave the page after the specified time. Set to 0 to disable this delay.
  **This option DELAYS adding mouse, scroll and touch listeners**

## Contribute

Feel free to contribute, message me for your ideas.

- Write tests.
- Report bugs.
- Share this project.
- Give a star if you like it.
- Improve the documentation.
- Open an issue if you have any.

# Instructions for Contributors

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## License

```
The MIT License (MIT)

Copyright © 2022 nickap

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
