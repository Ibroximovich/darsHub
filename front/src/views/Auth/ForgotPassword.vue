<script setup lang="ts">
import { ref } from 'vue'
import { useForgotPasswordStore } from '../../store'

const step = ref<'email' | 'reset'>('email')
const email = ref('')
const error = ref('')
const useForgotPassoword = useForgotPasswordStore()


function handleSubmit() {
    useForgotPassoword.requestForgotPassword(email.value)
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

                <!-- Step 1: Email -->
                <form @submit.prevent="handleSubmit" v-if="step === 'email'">
                    <h2 class="text-base font-semibold text-gray-900 mb-1">Parolni unutdingizmi?</h2>
                    <p class="text-xs text-gray-500 mb-5">Emailingizni kiriting, tasdiqlash kodi yuboramiz</p>

                    <div class="mb-5">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <input required v-model="email" type="email" placeholder="email@example.com"
                            class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                    </div>

                    <p v-if="error" class="text-red-500 text-xs mb-3">{{ error }}</p>

                    <button
                    type="submit"
                        :class="useForgotPassoword.isloading ? 'bg-blue-200' : 'bg-blue-600 hover:bg-blue-700'"
                        class="w-full py-2.5 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
                        {{ useForgotPassoword.isloading ? 'Yuborilmoqda...' : 'Kod yuborish' }}
                    </button>
                </form>
            </div>

            <p class="text-center text-sm text-gray-500 mt-4">
                Parolingizni eslaysizmi?
                <router-link to="/" class="text-blue-600 font-medium hover:underline">Kirish</router-link>
            </p>

        </div>
    </div>
</template>