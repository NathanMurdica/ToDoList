import { createApp } from 'vue'
import App from './App.vue'
import router from './router'           // import router
import 'bootstrap/dist/css/bootstrap.min.css'

const app = createApp(App)

app.use(router)     // tell vue to use the router
app.mount('#app')
