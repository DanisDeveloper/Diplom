import {ref} from "vue";
import {useStore} from "vuex";

export function useBiographyEdit(user, showToast) {
    const store = useStore();
    const isEditing = ref(false);
    const biographyEdit = ref("");
    const isPatchingBiography = ref(false);

    function handleEditClick() {
        biographyEdit.value = user.value.biography;
        isEditing.value = true;
    }

    function handleCancelClick() {
        if (isPatchingBiography.value) return;
        isEditing.value = false;
        biographyEdit.value = user.value.biography;
    }

    async function handleOkClick() {
        if (biographyEdit.value === user.value.biography) {
            isEditing.value = false;
            return;
        }

        isPatchingBiography.value = true;

        try {
            const response = await fetch(`${store.state.api.API_URL}/users?biography=${biographyEdit.value}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({biography: biographyEdit.value})
            });

            if (!response.ok) throw new Error(await response.text());

            user.value.biography = biographyEdit.value;
            isEditing.value = false;
        } catch (e) {
            showToast("Error updating biography", {duration: 3000, background: '#f10000'});
        } finally {
            isPatchingBiography.value = false;
        }
    }

    return {
        isEditing,
        biographyEdit,
        isPatchingBiography,
        handleEditClick,
        handleCancelClick,
        handleOkClick
    };
}
