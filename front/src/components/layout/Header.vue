<script setup lang="ts">
import { inject, ref, type Ref } from 'vue';
import { dataType } from '../../@types';

const isSidebarOpen = inject('isSidebarOpen', ref(false)) as Ref<boolean>;

const raw = localStorage.getItem('data');
const data: dataType | null = raw ? JSON.parse(raw) : null;
</script>


<template>
    <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
        <button
          @click="isSidebarOpen = true"
          class="lg:hidden p-2.5 -ml-2.5 rounded-lg hover:bg-gray-100 transition"
        >
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="flex-1">
          <h1 class="text-2xl font-extrabold text-gray-950">Bosh sahifa</h1>
          <p class="text-sm text-gray-600">Xush kelibsiz, <span class="capitalize">{{ data?.full_name }}!</span></p>
        </div>
      </header>
</template>