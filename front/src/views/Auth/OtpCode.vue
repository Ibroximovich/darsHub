<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useForgotPasswordStore, useOtpCodeStore } from '../../store'



const otp = ref<string[]>(['', '', '', '', '', ''])
const otpRefs = ref<(HTMLInputElement | null)[]>([])
const loading = ref(false)
const error = ref('')
const timer = ref(60)
let intervalId: ReturnType<typeof setInterval> | null = null
const useOtpCode = useOtpCodeStore()
const useForgotPassword = useForgotPasswordStore()

const email = useForgotPassword.email



const formattedTimer = computed(() => {
  const m = Math.floor(timer.value / 60)
  const s = timer.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

function startTimer() {
  timer.value = 60
  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(() => {
    if (timer.value > 0) timer.value--
    else if (intervalId) clearInterval(intervalId)
  }, 1000)
}

function onInput(index: number) {
  otp.value[index] = otp.value[index].replace(/[^0-9]/g, '')
  if (otp.value[index] && index < otp.value.length - 1) {
    otpRefs.value[index + 1]?.focus()
  }
}

function onKeydown(e: KeyboardEvent, index: number) {
  if (e.key === 'Backspace' && !otp.value[index] && index > 0) {
    otpRefs.value[index - 1]?.focus()
  }
}

async function verifyCode() {
  const code = otp.value.join('')
  if (code.length !== 6) {
    error.value = '6 xonali kodni to\'liq kiriting'
    return
  }
  error.value = ''
   const data ={
    email:email,
    code:code
   }
  useOtpCode.otpCodeRequest(data)
}

async function resendCode() {
  if (timer.value > 0) return
  loading.value = true
  error.value = ''
  // TODO: forgot-password API qayta chaqiriladi
  startTimer()
  loading.value = false
}

onMounted(() => {
  startTimer()
  otpRefs.value[0]?.focus()
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
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

      <div class="bg-white border border-gray-200 rounded-xl p-6 text-center">

        <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 class="text-base font-semibold text-gray-900 mb-1.5">Kodni kiriting</h2>
        <p class="text-xs text-gray-500 mb-6 leading-relaxed">
         6 xonali kodni kiriting
        </p>
          <form @submit.prevent="verifyCode">
              <div class="flex gap-2 justify-center mb-6">
                <input
                required
                  v-for="(_, index) in otp"
                  :key="index"
                  :ref="(el) => (otpRefs[index] = el as HTMLInputElement)"
                  v-model="otp[index]"
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  @input="onInput(index)"
                  @keydown="onKeydown($event, index)"
                  class="w-11 h-13 text-center text-xl font-semibold border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
      
              <p v-if="error" class="text-red-500 text-xs mb-4">{{ error }}</p>
      
              <button type="submit"
               
                :disabled="loading"
                class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60 mb-3"
              >
                {{ loading ? 'Tekshirilmoqda...' : 'Tasdiqlash' }}
              </button>
          </form>

        <p class="text-sm text-gray-500">
          Kod kelmadimi?
          <button
            @click="resendCode"
            :disabled="timer > 0"
            class="text-blue-600 font-medium hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            Qayta yuborish
          </button>
          <span v-if="timer > 0" class="text-gray-400"> ({{ formattedTimer }})</span>
        </p>

      </div>

      <p class="text-center text-sm text-gray-500 mt-4">
        <router-link to="/forgot-password" class="text-blue-600 hover:underline">← Email ni o'zgartirish</router-link>
      </p>

    </div>
  </div>
</template>