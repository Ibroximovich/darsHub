<script setup lang="ts">
import { ref } from 'vue';
import { useLoginStore } from '../../store';
import { dataType } from '../../@types';
const email = ref<string>('')
const password = ref<string>('')

const useLogin = useLoginStore()

function handleSubmit() {
  const data: dataType = {
    email: email.value,
    password: password.value
  }
  useLogin.loginRequest(data)


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
        <h2 class="text-base font-semibold text-gray-900 mb-5">Kirish</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input v-model="email" required type="email" placeholder="email@example.com"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
          </div>
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="text-sm font-medium text-gray-700">Parol</label>
              <router-link to="/forgot-password" href="#" class="text-xs text-blue-600 hover:underline">Unutdingizmi?</router-link>
            </div>
            <input v-model="password" required type="password" placeholder="••••••••"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
          </div>



          <button :class="['cursor-pointer w-full py-2.5 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60',
            useLogin.isLoading ? 'bg-blue-300' : 'bg-blue-600'
          ]">
            {{ useLogin.isLoading ? "Kirish..." : "Kirish" }}
          </button>


        </form>
      </div>

      <p class="text-center text-sm text-gray-500 mt-4">
        Akkauntingiz yo'qmi?
        <router-link to="/register" class="text-blue-600 font-medium hover:underline">
          Ro'yxatdan o'ting
        </router-link>
      </p>

    </div>
  </div>
</template>