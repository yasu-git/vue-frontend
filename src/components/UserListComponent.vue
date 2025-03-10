<template>
	<div class="container">
		<h1 class="bg-secondary text-white display-4 px-3">Vue3</h1>
		<p>{{ message }}</p>

		<!-- 読み込み中の表示 -->
		<div v-if="isLoading" class="text-center">
			<p>Loading...</p>
		</div>

		<!-- エラー発生時の表示 -->
		<div v-if="errorMessage" class="alert alert-danger">
			{{ errorMessage }}
		</div>

		<FormUpdateComponent
			v-if="editFormShow"
			:edit-user-data="selectedUser"
			:api-url="apiUrl"
			:users-crud-url="usersCrudUrl"
			@update-success="handleUpdateSuccess"
			@cancel-edit="cancelEdit"
		/>

		<!-- ユーザーリスト表示 -->
		<table v-if="!isLoading" class="table">
			<thead class="thead-dark">
				<tr>
					<th>連番</th>
					<th>Name</th>
					<th>Mail</th>
					<th>Tel</th>
					<th>更新</th>
					<th>削除</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(user, index) in users" :key="user.id">
					<td>{{ index + 1 }}</td>
					<td>{{ user.name || "N/A" }}</td>
					<td>{{ user.email || "N/A" }}</td>
					<td>{{ user.tel || "N/A" }}</td>
					<td>
						<button @click="editUser(user)">更新</button>
					</td>
					<td>
						<button @click="deleteUser(user.id)">削除</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import FormUpdateComponent from "./FormUpdateComponent.vue";
import { useLoading, apiUrl, usersCrudUrl, useFormActions } from "@/composables/useCommon";


// 変数の宣言
const message = "User List"; // タイトルメッセージ
const users = ref([]); // ユーザーリスト（リアクティブな配列）
const errorMessage = ref(""); // エラーメッセージを管理

const { isLoading, startLoading, stopLoading} = useLoading();
const { editFormShow,selectedUser, showEditForm, hideEditForm, cancelEdit} = useFormActions();
selectedUser.value = {}; // ✅ 初期値を `{}` にする
/**
 * ユーザー情報を取得する関数
 * - API からユーザーリストを取得
 */
const fetchUsers = async () => {
	startLoading();
	errorMessage.value = ""; // エラーメッセージをリセット

	try {
		// API からデータを取得
		const response = await axios.get(`${apiUrl}${usersCrudUrl}`);

		// 取得したデータを `users` に格納
		users.value = response.data.map(user => ({
			id: user._id || "不明",
			name: user.name || "N/A",
			email: user.email || "N/A",
			tel: user.tel || "N/A",
		}));

		//  成功時のコンソールログ（デバッグ用）
		console.log("取得したユーザーデータ", users.value);
	} catch (error) {
		console.error("データの取得に失敗しました", error);
		errorMessage.value = error.response?.data?.message || "データの取得に失敗しました";
	} finally {
		stopLoading(); // ローディング終了
	}
};

/**
 *  ユーザーを削除する関数
 * - API に `DELETE` リクエストを送信して、ユーザーを削除
 * - 削除後、フロントエンド側の `users` 配列から該当ユーザーを削除
 */
const deleteUser = async (id) => {
	// ID が無効な場合、削除を中止
	if (!id || id === "不明") {
		alert("削除できません: IDが無効です");
		return;
	}

	// ユーザーに削除の確認を求める
	if (!confirm("本当に削除しますか？")) return;

	try {
		// API に DELETE リクエストを送信
		await axios.delete(`${apiUrl}${usersCrudUrl}/${id}`);

		// フロントエンドの `users` リストから該当 ID のユーザーを削除
		users.value = users.value.filter(user => user.id !== id);
		alert("削除しました");
	} catch (error) {
		//  削除失敗時の処理
		console.error("削除に失敗しました", error);
		alert("削除に失敗しました");
	}
};


/**
 *  ユーザーを更新する関数
 * - API に `DELETE` リクエストを送信して、ユーザーを更新
 */
// ユーザーを編集
const editUser = (user) => {
	if (!user || !user.id) {
        console.error("編集するユーザー情報が無効です:", user);
        return;
    }
	selectedUser.value = { ...user };
	// console.log("🛠 選択したユーザー:", selectedUser.value); // デバッグログ
	showEditForm();
};

// 更新成功時の処理
const handleUpdateSuccess = async () => {
	hideEditForm();
	await fetchUsers();
};

// `fetchUsers` を外部 (`App.vue`) から呼び出せるようにする
defineExpose({
	fetchUsers
});
// コンポーネントがマウントされたら `fetchUsers` を実行し、ユーザーリストを取得
onMounted(fetchUsers);
</script>

<style scoped>
/* コンテナの余白設定 */
.container {
	margin-top: 20px;
}
</style>
