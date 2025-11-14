import { ref } from "vue";

export function useChangePassword() {
    const oldPassword = ref("");
    const newPassword = ref("");
    const confirmPassword = ref("");
    const passwordLog = ref("");
    const succeedPasswordChange = ref(false);
    const isPatchingPassword = ref(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const resetPasswordLog = () => {
        passwordLog.value = "";
    };

    const preventWhitespace = (event) => {
        if (event.key.match(/\s/)) {
            event.preventDefault();
        }
    };

    const changePassword = async () => {
        if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
            passwordLog.value = "All fields are required";
            return;
        }

        resetPasswordLog();

        if (newPassword.value !== confirmPassword.value) {
            passwordLog.value = "Passwords don't match";
            return;
        }

        const payload = {
            oldPassword: oldPassword.value,
            newPassword: newPassword.value,
        };

        try {
            isPatchingPassword.value = true;

            const response = await fetch(`${API_URL}/auth/password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (response.status === 403) {
                passwordLog.value = "Wrong old password";
                return;
            }

            succeedPasswordChange.value = true;
            passwordLog.value = "Password changed successfully";

            oldPassword.value = "";
            newPassword.value = "";
            confirmPassword.value = "";
        } catch (error) {
            passwordLog.value = "Error changing password";
        } finally {
            isPatchingPassword.value = false;
        }
    };

    return {
        oldPassword,
        newPassword,
        confirmPassword,
        passwordLog,
        succeedPasswordChange,
        isPatchingPassword,
        resetPasswordLog,
        preventWhitespace,
        changePassword,
    };
}
