import { ref, computed } from "vue";

export function useLoading() {
	const isLoading = ref(false);
	const nowLoading = computed(() => (isLoading.value ? "Loading..." : "Submit"));

	function startLoading() {
		isLoading.value = true;
	}

	function stopLoading() {
		isLoading.value = false;
	}

	return { isLoading, nowLoading, startLoading, stopLoading };
}

// ✅ エラーメッセージをクリア
export function useResponseMessage() {
	const responseMessage = ref("");

	function clearResponseMessage() {
		responseMessage.value = "";
	}

	function setResponseMessage(str){
		responseMessage.value = str;
	}

	return { responseMessage, clearResponseMessage ,setResponseMessage };
}
/* global process */

/**
 * **API のベース URL を取得**
 */
export const apiUrl = process.env.VUE_APP_API_URL || "http://localhost:3000";

/**
 * **ユーザー CRUD API のエンドポイント**
 */
export const usersCrudUrl = process.env.VUE_APP_USER_CRUD_URL || "/api/users";


/**
 * **オブジェクトの空チェック**
 * - `null` または `{}` の場合 `true` を返す
 * @param {object} obj
 * @returns {boolean} 空のオブジェクトかどうか
 */
export function isEmptyObject(obj) {
	return !obj || Object.keys(obj).length === 0;
}

/**
 * **簡易的なログ関数**
 * - デバッグ時に統一されたログ出力ができる
 * @param {string} message - ログに表示するメッセージ
 * @param {any} data - ログデータ（オプション）
 */
export function logDebug(message, data = null) {
	console.log(`🛠 [DEBUG] ${message}`, data);
}

export function useFormActions() {
    const editFormShow = ref(false);
	const selectedUser = ref({});

    function showEditForm() {
        editFormShow.value = true;
    }

    function hideEditForm() {
        editFormShow.value = false;
    }

    function cancelEdit() {
        // 今後リセット処理などを追加する場合、ここに書く
        hideEditForm();
		selectedUser.value = null; // 編集中のデータをクリア
    }

    return {
        editFormShow,
		selectedUser,
        showEditForm,
        hideEditForm,
        cancelEdit
    };
}

export function useResetForm() {
	return function resetForm(formData,$v = null, responseMessage = null) {
		// フォームデータのすべてのキーを空文字にリセット
		Object.keys(formData).forEach(key => {
			formData[key] = '';
		});

		// バリデーションが渡されている場合はリセット
		if ($v) {
			$v.value.$reset();
		}

		// エラーメッセージが渡されている場合はリセット
		if (responseMessage) {
			responseMessage.value='';
		}
	};
}