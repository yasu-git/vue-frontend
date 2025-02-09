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

		<table v-if="!isLoading" class="table">
			<thead class="thead-dark">
				<tr>
					<th>連番</th>
					<th>Name</th>
					<th>Mail</th>
					<th>Tel</th>
					<th>削除</th>
				</tr>
			</thead>
			<!-- データを表示する部分 -->
			<tbody>
				<tr v-for="(user, index) in users" :key="user.id">
					<td>{{ index + 1 }}</td>
					<td>{{ user.name || "N/A" }}</td>
					<td>{{ user.email || "N/A" }}</td>
					<td>{{ user.tel || "N/A" }}</td>
					<td><button @click="deleteUser(user.id)">削除</button></td>
				</tr>
			</tbody>
		</table>
		<!-- エラー発生時の表示 -->
		<div v-if="error" class="alert alert-danger" role="alert">
			{{ errorMessage }}
		</div>
	</div>

</template>


<!-- vue vsersion.3 -->
<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

//変数の宣言
// メッセージの状態を保持
const message = "User List";
// ユーザー一覧データを保持する配列
const users = ref([]);
// ローディング状態を管理
const isLoading = ref(false);
// エラーメッセージの状態を保持
const errorMessage = ref("");
// APIのエンドポイントURL（環境変数から取得 or デフォルト）
/* global process */
const apiUrl = process.env.VUE_APP_API_URL || "http://localhost:3000";
const usersCrudUrl = process.env.VUE_APP_USER_CRUD_URL;
// ユーザー情報を取得する非同期関数
const fetchUsers = async () => {
	isLoading.value = true; // ローディング開始
	errorMessage.value = ""; // エラーメッセージをクリア

	try {
		// APIからデータを取得
		const response = await axios.get(`${apiUrl}${usersCrudUrl}`);
		if (response.status !== 200) {
			throw new Error("APIリクエスト失敗");
		}
		console.log(users)
		// 取得したデータをusers配列に格納
		users.value = response.data.map(user => ({
			id: user._id || "不明",
			name: user.name || "N/A",
			email: user.email || "N/A",
			tel: user.tel || "N/A",
		}));
		console.log("取得したユーザーデータ", users.value);
	} catch (error) {
		console.error("データの取得に失敗しました", error);
		errorMessage.value = "データの取得に失敗しました";
	} finally {
		isLoading.value = false; // ローディング終了
	}
};

// ユーザー情報を削除する関数
const deleteUser = async (id) => {

	if (!id || id === "不明") {
		alert("削除できません: IDが無効です");
		return;
	}

	if (!confirm("本当に削除しますか？")) return;

	try {
		await axios.delete(`${apiUrl}${usersCrudUrl}/${id}`);
		// フロントエンドのusersリストから削除
		users.value = users.value.filter(user => user.id !== id);
		alert("削除しました");
	} catch (error) {
		console.error("削除に失敗しました", error);
		alert("削除に失敗しました");
	}
};

// コンポーネントがマウントされたらfetchUsersを実行
onMounted(fetchUsers);
</script>

<style scoped>
/* コンテナの余白設定 */
.container {
	margin-top: 20px;
}
</style>

<!-- vue vsersion.2の記述方法 -->
<!--

<script>
import axios from "axios";// axiosをインポート

export default {
	name: "UserListComponent",// コンポーネント名
	data() {// データを返す
		return {
			message: "User List",// メッセージ
			users: [], // データ格納用
			isLoading: false, // ローディング状態管理用
			error: '',        // エラーメッセージ表示用
			// 環境変数の取得 (Viteの場合は import.meta.env.VITE_APP_API_URL などに変更)
			apiUrl: process.env.VUE_APP_API_URL || 'http://localhost:3000',// バックエンドのエンドポイント
		};
	},
	async mounted() {
		await this.fetchUsers();// データ取得
	},
	methods: {

		async fetchUsers() {

			this.isLoading = true;	// ローディング状態にする
			this.error = '';			// エラーメッセージを初期化

			try {
				// バックエンドからデータを取得
				const response = await axios.get(`${this.apiUrl}/api/notes_from_b`);	// バックエンドのエンドポイントを指定

				//サーバーから受け取ったデータを整形してusers配列に格納
				this.users = response.data.map(
					user => ({
						id: user.id,
						name: user.name,
						email: user.email,
						tel: user.tel,
					})
				);

				console.log("取得したユーザーデータ", this.users);
			} catch (error) {
				console.error("データの取得に失敗しました", error);
				this.error = 'データの取得に失敗しました';
			} finally {
				this.isLoading = false;	// ローディング状態を解除
			}
		},
	},
};
</script>

<style scoped>
.container {
	margin-top: 20px;
}
</style>

-->