<script setup lang="ts">
import { ref } from 'vue'
import { useForgotPasswordStore, useOtpCodeStore, useResetPasswordStore } from '../../store'


const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const useResetPassword = useResetPasswordStore()
const useForgotPassword = useForgotPasswordStore()
const useOtpCode = useOtpCodeStore()



async function resetPassword() {
  error.value = ''

  if (newPassword.value.length < 8) {
    error.value = 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Parollar mos kelmadi'
    return
  }
  const email = useForgotPassword.email
  const code = useOtpCode.code

  const data ={
    email:email,
    code:code,
    new_password:newPassword.value

  }

  useResetPassword.resetRequestPassword(data)


}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">

      <div class="text-center mb-6">
        <div class="w-13 h-13 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 class="text-xl font-semibold text-gray-900">DarsHub</h1>
        <p class="text-sm text-gray-500 mt-1">Repetitorlar uchun boshqaruv tizimi</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">

        <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 class="text-base font-semibold text-gray-900 mb-1 text-center">Yangi parol o'rnating</h2>
        <p class="text-xs text-gray-500 mb-6 text-center">Kod tasdiqlandi, endi yangi parol kiriting</p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Yangi parol</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="••••••••"
            class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          <p class="text-xs text-gray-400 mt-1.5">Kamida 8 ta belgi</p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Parolni tasdiqlang</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <p v-if="error" class="text-red-500 text-xs mb-3">{{ error }}</p>

        <button
          @click="resetPassword"
          :disabled="loading"
          class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {{ loading ? 'Yangilanmoqda...' : 'Parolni yangilash' }}
        </button>

      </div>

    </div>
  </div>
</template>