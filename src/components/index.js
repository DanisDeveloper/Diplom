import DialogWindow from "@/components/DialogWindow.vue";
import Spinner from "@/components/Spinner.vue";
import IconButton from "@/components/IconButton.vue";
import Loader from "@/components/Loader.vue";
import Pagination from "@/components/Pagination.vue";
import Toast from "@/components/Toast.vue";
import RadioButtons from "@/components/RadioButtons.vue";
import NavBar from "@/components/NavBar.vue";
import icons from "@/components/Icons/index.js"
import AppFooter from "@/components/AppFooter.vue";
import Error from "@/components/Error.vue";
import ShaderWindow from "@/components/ShaderWindow.vue";

export default [
    ...icons,
    AppFooter,
    DialogWindow,
    Error,
    IconButton,
    Loader,
    NavBar,
    Pagination,
    RadioButtons,
    ShaderWindow,
    Spinner,
    Toast,
]