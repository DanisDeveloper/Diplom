import {createStore} from "vuex";
import ui from "@/store/modules/ui.js";
import auth from "@/store/modules/auth.js";
import search from "@/store/modules/search.js";
import api from "@/store/modules/api.js";

export default createStore({
    modules:{
        ui,
        auth,
        search,
        api,
    },

})