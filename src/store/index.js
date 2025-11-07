import {createStore} from "vuex";
import ui from "@/store/modules/ui.js";
import auth from "@/store/modules/auth.js";
export default createStore({
    modules:{
        ui,
        auth
    },

})