<script setup lang="ts">
import { provide, ref } from 'vue';
import Header from '../../components/layout/Header.vue';
import Sidebar from '../../components/layout/Sidebar.vue';

const isSidebarOpen = ref(false);

provide('isSidebarOpen', isSidebarOpen);
</script>

<template>
  <div class="bg-gray-50 flex h-screen overflow-hidden">
    <Sidebar/>
    <div class="flex-1 flex flex-col h-full"> <Header/>
      <main class="flex-1 p-4 lg:p-6 overflow-y-auto"> 
        <RouterView />
      </main>
    </div>
  </div>
</template>