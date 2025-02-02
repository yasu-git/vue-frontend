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

		<table class="table" v-if="!isLoading && users.length">
			<thead class="thead-dark">
				<tr>
					<th>連番</th>
					<th>Name</th>
					<th>Mail</th>
					<th>Tel</th>
				</tr>
			</thead>
			<!-- データを表示する部分 -->
			<tbody>
				<tr v-for="(user, index) in users" :key="user.Id">
					<td>{{ index + 1 }}</td>
					<td>{{ user.name || "N/A" }}</td>
					<td>{{ user.email || "N/A" }}</td>
					<td>{{ user.tel || "N/A" }}</td>
				</tr>
			</tbody>
		</table>
		<!-- エラー発生時の表示 -->
		<div v-if="error" class="alert alert-danger" role="alert">
			{{ error }}
		</div>
	</div>

</template>

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
