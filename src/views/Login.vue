<template>
  <TextInput label="Username" name="username" v-model="username" @keyup.enter="signIn" />
  <TextInput label="Password" name="password" type="password" v-model="password" @keyup.enter="signIn" />
  <button class="outlined" @click="signIn">Sign In</button>
  <button class="forgot-password" @click="forgotPassword">Forgot Password?</button>
  <div style="height:32px;font-style:italic">{{ error || '' }}</div>
</template>

<script lang="ts">
import { defineComponent, Fragment, h, ref } from 'vue';
import { useSession } from '../api/session';
import { useDialog } from '../components/Dialog.vue';
import { useSnackbar } from '../components/Snackbar.vue';
import TextInput from '../forms/TextInput.vue';
import { passwordIsValid } from '../utils/password';

export default defineComponent({
  components: {
    TextInput,
  },
  setup() {
    const { isSignedIn, forgotPassword, confirmForgotPassword, signIn } = useSession();
    const { dialog } = useDialog();
    const snackbar = useSnackbar();

    const username = ref<string>();
    const password = ref<string>();
    const error = ref(isSignedIn.value
      ? 'You are already signed in. Continue only if you would like to switch users.'
      : ''
    );

    const confirmPassword = (username: string) => {
      const confirmationCode = ref('');
      const newPassword = ref('');
      dialog({
        title: () => 'Confirmation Code',
        body: () => h(Fragment, [
          h('p', `Your confirmation code was emailed to ${username}. Please enter it and your new password below.`),
          h(TextInput, {
            label: 'Confirmation Code',
            name: 'confirmation-code',
            modelValue: confirmationCode.value,
            'onUpdate:modelValue': (value: string) => {
              confirmationCode.value = value;
            }
          }),
          h(TextInput, {
            label: 'New Password',
            type: 'password',
            name: 'new-password',
            modelValue: newPassword.value,
            'onUpdate:modelValue': (value: string) => {
              newPassword.value = value;
            }
          }),
        ]),
        actions: [{
          text: 'Cancel',
        }, {
          text: 'Submit',
          disabled: () => !(newPassword.value && passwordIsValid(newPassword.value) && confirmationCode.value),
          handler: async () => {
            try {
              await confirmForgotPassword(username, newPassword.value, confirmationCode.value);
              snackbar('Your password has been reset.');
            } catch (err) {
              console.error(err);
              snackbar('Something went wrong.');
            }
          },
        }]
      });
    }

    return {
      error,
      username,
      password,
      forgotPassword() {
        const forgotPasswordUsername = ref(username.value || '');
        const close = dialog({
          title: () => 'Forgot Password',
          body: () => h(Fragment, [
            h('p', 'Please ensure your username is correct, and a new password will be emailed to you.'),
            h(TextInput, {
              label: 'Username',
              name: 'forgot-password-username',
              modelValue: forgotPasswordUsername.value,
              'onUpdate:modelValue': (value: string) => {
                forgotPasswordUsername.value = value;
              }
            }),
            h('button', {
              onClick: () => {
                const username = forgotPasswordUsername.value;
                if (username) {
                  close();
                  confirmPassword(username);
                } else {
                  snackbar('Please enter your username first.');
                }
              },
              title: 'Enter your code',
              style: {
                margin: '16px 0',
                width: '100%',
              },
            }, 'I already have a code')
          ]),
          actions: [{
            text: 'Cancel',
          }, {
            text: 'Submit',
            disabled: () => !forgotPasswordUsername.value,
            handler: async () => {
              const username = forgotPasswordUsername.value;
              try {
                await forgotPassword(username);
                confirmPassword(username);
              } catch (err) {
                console.error(err);
                snackbar('Something went wrong.');
              }
            },
          }]
        });
      },
      signIn: async () => {
        const uName = username.value;
        const pWord = password.value;
        if (uName && pWord) {
          try {
            if (await signIn(uName, pWord)) {
              snackbar('You\'ve successfully signed in.');
            }
          } catch (err) {
            error.value = err.message;
          }
        } else {
          error.value = 'Both the username and password fields are required.';
        }
      },
    };
  },
});
</script>
