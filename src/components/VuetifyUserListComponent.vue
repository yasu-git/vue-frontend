<template>
	<v-container>
		<v-card class="pa-4">
			<v-card-title class="bg-secondary text-white text-h4">Vue3</v-card-title>
			<v-card-text>
				<p>{{ message }}</p>

				<!-- 読み込み中の表示 -->
				<v-progress-circular v-if="isLoading" indeterminate color="primary"></v-progress-circular>

				<!-- エラー発生時の表示 -->
				<v-alert v-if="errorMessage" type="error" dense>
					{{ errorMessage }}
				</v-alert>

				<!-- ユーザーデータのテーブル -->
				<v-table v-if="!isLoading && users.length" class="mt-4">
					<thead>
						<tr>
							<th>連番</th>
							<th>Name</th>
							<th>Mail</th>
							<th>Tel</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(user, index) in users" :key="user.id">
							<td>{{ index + 1 }}</td>
							<td>{{ user.name || "N/A" }}</td>
							<td>{{ user.email || "N/A" }}</td>
							<td>{{ user.tel || "N/A" }}</td>
						</tr>
					</tbody>
				</v-table>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// 変更しないデータは `const` で定義
const message = "User List";
const apiUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";
const usersCrudUrl = import.meta.env.VUE_APP_USER_CRUD_URL;

// 変更するデータは `ref` を使用
const users = ref([]); // APIから取得するためリアクティブ
const isLoading = ref(false); // ローディング状態管理
const errorMessage = ref(""); // エラーメッセージ管理

// ユーザー情報を取得する非同期関数
const fetchUsers = async () => {
	isLoading.value = true;  // ✅ `isLoading` は変更されるので `.value` が必要
	errorMessage.value = ""; // ✅ エラー発生時に変更されるため `.value` が必要

	try {
		const response = await axios.get(`${apiUrl}${usersCrudUrl}`);
		if (response.status !== 200) {
			throw new Error("APIリクエスト失敗");
		}

		users.value = response.data.map(user => ({ // ✅ API から取得するため `.value` が必要
			id: user.id || "不明",
			name: user.name || "N/A",
			email: user.email || "N/A",
			tel: user.tel || "N/A",
		}));

		console.log("取得したユーザーデータ", users.value);
	} catch (error) {
		console.error("データの取得に失敗しました", error);
		errorMessage.value = error.response?.data?.message || "データの取得に失敗しました";
	} finally {
		isLoading.value = false; // ✅ `isLoading` の状態を変更
	}
};

// コンポーネントがマウントされたらfetchUsersを実行
onMounted(fetchUsers);
</script>

<style scoped>
/* Vuetifyのv-containerが適切な余白を持つため、特別なスタイル不要 */
</style>
