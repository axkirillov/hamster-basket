import { createApp } from 'vue'
import App from './App.vue'
import { supabase } from './lib/supabase'
import { userSession } from '@/vuetils/useAuth'
import './assets/tailwind.css'
import './assets/main.css'
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faXmark, faBars } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faXmark, faBars)

createApp(App)
	.component('font-awesome-icon', FontAwesomeIcon)
	.mount('#app')

/**
 * Keeps track of if the user is logged in or out and will update userSession state accordingly.
 */
supabase.auth.onAuthStateChange((event: any, session: any): void => {
	console.log('onAuthStateChange', event, session)
	userSession.value = session
})
