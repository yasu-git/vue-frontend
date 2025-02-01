<template>
	<div class="container">
		<h1 class="bg-secondary text-white display-4 px-3">Vue3</h1>
		<p>{{ message }}</p>
		<table class="table">
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
				<tr v-for="(user, index) in users" :key="user.userId">
					<td>{{ index + 1 }}</td>
					<td>{{ user.name || "N/A"}}</td>
					<td>{{ user.mail || "N/A"}}</td>
					<td>{{ user.tel || "N/A"}}</td>
				</tr>
			</tbody>
		</table>
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
		};
	},
	mounted() {
		// バックエンドのエンドポイント
		const backendEndpoint = `${process.env.VITE_API_URL}/notes_from_b`;

		// Axiosでバックエンドからデータを取得
		axios
			.get(backendEndpoint)			// バックエンドのエンドポイントを指定
			.then((response) => {			// データの取得に成功した場合
				this.users = response.data.map(
					user => ({
						id: user.id,
						name: user.name,
						mail: user.mail,
						tel: user.tel,
					})
				); // データをセット
				console.log(this.users);	// データをコンソールに表示
			})
			.catch((error) => {
				console.error("データの取得に失敗しました", error);
			});
	},
};
</script>

<style scoped>
.container {
	margin-top: 20px;
}
</style>
