<template>
  <TextInput label="New Password" name="new-password" type="password" v-model="password" @blur="validateFirst" />
  <TextInput label="Confirm New Password" name="confirm-new-password" type="password" v-model="confirmPassword" @blur="validateBoth" />
  <button class="outlined" @click="changePassword">Change Password</button>
  <div>Please create your new password.</div>
  <div style="height:32px;font-style:italic">{{ error || '' }}</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSession } from '../api/session';
import { passwordIsValid } from '../utils/password';
import TextInput from '../forms/TextInput.vue';
import { useSnackbar } from '../components/Snackbar.vue';

export default defineComponent({
  emits: ['set-title'],
  components: {
    TextInput,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const session = route.query.session as string;
    const username = route.query.username as string;
    if (!session || !username) {
      router.replace('/login');
    }

    const { newPasswordRequired } = useSession();
    const snackbar = useSnackbar();
    const password = ref<string>();
    const confirmPassword = ref<string>();
    const error = ref<string>();

    const validate = (validator: () => string | undefined) => {
      const issue = validator();
      if (issue) {
        error.value = issue;
        return false;
      }
      return true;
    }

    const validateFirst = () => validate(() => {
      let { value } = password;
      if (!value) {
        return 'The New Password field is required.';
      } else if (!passwordIsValid(value)) {
        return 'Your password must contain one lowercase letter, one number, and be at least 8 characters.'
      }
    });

    const validateBoth = () => validateFirst() && validate(() => {
      if (password.value !== confirmPassword.value) {
        return 'The passwords do not match.';
      }
    });

    return {
      error,
      confirmPassword,
      password,
      validateFirst,
      validateBoth,
      changePassword: async () => {
        if (validateBoth()) {
          try {
            await newPasswordRequired(username, password.value!, session);
            snackbar('You\'ve successfully signed in.');
          } catch (err) {
            error.value = err.message;
            snackbar('Something went wrong.');
          }
        }
      },
    };
  },
});
</script>
