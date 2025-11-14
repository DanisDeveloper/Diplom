import {computed, ref} from "vue";
import {useRoute} from "vue-router";
import {useStore} from "vuex";

export function useProfileShaders(showToast) {
    const route = useRoute();
    const store = useStore();

    const isLoadingShaders = ref(false);
    const shaders = ref([]);
    const totalShaders = computed(() => shaders.value.length)
    const totalPages = ref(0);
    const currentPage = ref(1);
    const SHADERS_PER_PAGE = 8;
    const sortOption = ref("NEWEST");

    const isClipboardCopied = ref(false);
    const clipboardShaderId = ref(null);

    const showShaderDeleteDialog = ref(false);
    const isDeletingShader = ref(false);
    const shaderIdForDelete = ref(null);

    // ------------------
    // Fetch shaders
    // ------------------
    async function fetchShaders(username = route.params.id, page = currentPage.value, pageSize = SHADERS_PER_PAGE, sort = sortOption.value) {
        isLoadingShaders.value = true;
        try {
            const res = await fetch(`${store.state.api.API_URL}/shaders?username=${username}&page=${page - 1}&page_size=${pageSize}&sort_option=${sort}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            });

            if (!res.ok) throw new Error(await res.text() || "Server error");

            totalPages.value = parseInt(res.headers.get('X-Total-Pages')) || 0;
            shaders.value = await res.json();
        } catch (err) {
            showToast('Error getting shaders', { duration: 3000, background: '#4caf50' });
        } finally {
            isLoadingShaders.value = false;
        }
    }

    // ------------------
    // Delete shader
    // ------------------
    async function deleteShader() {
        if (!shaderIdForDelete.value) return;
        isDeletingShader.value = true;
        try {
            const res = await fetch(`${store.state.api.API_URL}/shaders/${shaderIdForDelete.value}`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            });

            if (!res.ok) throw new Error("Failed to delete shader");

            shaders.value = shaders.value.filter(s => s.id !== shaderIdForDelete.value);
            shaderIdForDelete.value = null;
            showToast('Successfully deleted shader', { duration: 3000, background: '#4caf50' });
            await fetchShaders();
        } catch (err) {
            showToast('Error deleting shader', { duration: 3000, background: '#f10000' });
        } finally {
            isDeletingShader.value = false;
            showShaderDeleteDialog.value = false;
        }
    }

    // ------------------
    // Clipboard
    // ------------------
    function shareShader(shaderId) {
        navigator.clipboard.writeText(`${window.location.origin}/new/${shaderId}`);
        isClipboardCopied.value = true;
        clipboardShaderId.value = shaderId;
        setTimeout(() => {
            isClipboardCopied.value = false;
            clipboardShaderId.value = null;
        }, 1000);
    }

    return {
        shaders,
        totalShaders,
        isLoadingShaders,
        totalPages,
        currentPage,
        sortOption,
        SHADERS_PER_PAGE,
        isClipboardCopied,
        clipboardShaderId,
        showShaderDeleteDialog,
        isDeletingShader,
        shaderIdForDelete: shaderIdForDelete,
        fetchShaders,
        deleteShader,
        shareShader
    };
}
