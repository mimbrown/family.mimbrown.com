import 'brand-styles/all.scss';
import { createApp, h } from 'vue';
import App from './App.vue';
import { DialogContainer } from './components/Dialog.vue';
import SnackbarContainer from './components/Snackbar.vue';
import router from './router';
import './styles/breakpoints.scss';

createApp({
  render() {
    return h(DialogContainer,
      h(SnackbarContainer,
        h(App),
      ),
    );
  }
}).use(router).mount('body');

