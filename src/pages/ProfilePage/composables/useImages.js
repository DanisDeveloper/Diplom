import { ref } from "vue";
import { useToast } from "@/composables/useToast.js";
import {useStore} from "vuex";

export function useProfileImages(user) {
    const { show } = useToast();
    const store = useStore();

    const avatarInput = ref(null);
    const backgroundInput = ref(null);

    const showAvatarDeleteDialog = ref(false);
    const isDeletingAvatar = ref(false);

    // ============================
    //       TRIGGERS
    // ============================

    function triggerAvatarInput() {
        if (user.value.avatarUrl) {
            showAvatarDeleteDialog.value = true;
        } else {
            avatarInput.value?.click();
        }
    }

    function triggerBackgroundInput() {
        backgroundInput.value?.click();
    }

    // ============================
    //      UPLOAD HANDLER
    // ============================

    async function userImageLoadHandler(event, imageType) {
        const image = event.target.files?.[0];
        if (!image) {
            show("Error uploading image", true);
            return;
        }

        const formData = new FormData();
        formData.append("image", image);

        try {
            const response = await fetch(`${store.state.api.API_URL}/users/image?type=${imageType}`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) throw new Error("Upload failed");

            const imageUrl = await response.text();
            show("Successfully uploaded image",{duration: 3000, background: '#298e32'});

            if (imageType === "AVATAR") user.value.avatarUrl = imageUrl;
            if (imageType === "BACKGROUND") user.value.backgroundUrl = imageUrl;

        } catch (e) {
            show("Error uploading image", {duration: 3000, background: '#f10000'});
        }
    }

    // ============================
    //     DELETE AVATAR / BG
    // ============================

    async function deleteAvatar() {
        isDeletingAvatar.value = true;

        try {
            const response = await fetch(`${store.state.api.API_URL}/users/image?type=AVATAR`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) throw new Error();

            user.value.avatarUrl = null;
            show("Successfully cleared avatar",{duration: 3000, background: '#298e32'});
        } catch (e) {
            show("Error clearing avatar", {duration: 3000, background: '#f10000'});
        } finally {
            isDeletingAvatar.value = false;
            showAvatarDeleteDialog.value = false;
        }
    }

    async function handleClearBackground() {
        isDeletingAvatar.value = true;

        try {
            const response = await fetch(`${store.state.api.API_URL}/users/image?type=BACKGROUND`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) throw new Error();

            user.value.backgroundUrl = null;
            show("Successfully cleared background", {duration: 3000, background: '#298e32'});
        } catch (e) {
            show("Error clearing background", {duration: 3000, background: '#f10000'});
        } finally {
            isDeletingAvatar.value = false;
        }
    }

    return {
        avatarInput,
        backgroundInput,

        showAvatarDeleteDialog,
        isDeletingAvatar,

        triggerAvatarInput,
        triggerBackgroundInput,
        userImageLoadHandler,
        deleteAvatar,
        handleClearBackground,
    };
}
