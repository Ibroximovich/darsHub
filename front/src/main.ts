import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routes/index.ts'
import { createPinia } from 'pinia'
import 'vue3-toastify/dist/index.css';

 const app =  createApp(App)
 app.use(router)
 app.use(createPinia())
 app.mount('#app')

