<template>
	<div class="container">
		<h1>Form Submission</h1>
		<form @submit.prevent="submitForm">
			<!-- name, email, tellの入力フォーム -->
			<!-- name -->
			<div>
				<label for="name">Name:</label><br />
				<input type="text" id="name" v-model="formData.name" required /><br /><br />
			</div>

			<!-- email -->
			<div>
				<label for="email">Email:</label><br />
				<input type="email" id="email" v-model.trim="formData.email" required /><br /><br />
			</div>

			<!-- tell -->
			<div>
				<label for="tel">tel:</label><br />
				<input type="tel" id="tel" v-model.trim="formData.tel" required/><br /><br />
			</div>

			<!-- 送信中は押せないようにする-->
			<button type="submit" :disabled="isLoading">
				{{isLoading ? 'Loading...' : 'Submit'}}
			</button>
		</form>
		<p v-if="responseMessage">{{ responseMessage }}</p>
	</div>
</template>

<script>
export default {
	//dataオブジェクトにformDataとresponseMessageプロパティを追加
	data() {
		return {
			formData: {
				name: '',
				email: '',
				tel: '',
			},
			responseMessage: '',
			isLoading: false,//送信中かどうかを示すフラグ
			apiUrl: process.env.VUE_APP_API_URL || 'http://localhost:3000',// バックエンドのエンドポイント

		};
	},
	//methodsオブジェクトにsubmitFormメソッドを追加
	methods: {
		async submitForm() {
			console.log("Sending data:", JSON.parse(JSON.stringify(this.formData)));
			this.isLoading = true;//送信中フラグをtrueに設定
			this.responseMessage = '';//responseMessageを空に設定

			try {
				//api/formへPOSTリクエストを送信
				const response = await fetch(`${this.apiUrl}/api/form`, {
					method: 'POST',//POSTリクエスト
					//Content-Typeヘッダーをapplication/jsonに設定
					headers: {
						'Content-Type': 'application/json',
					},
					//formDataオブジェクトをJSON文字列に変換してリクエストボディに設定
					body: JSON.stringify(this.formData),
				});

				if(!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Server Error');
				}

				//レスポンスをJSON形式で取得
				const result = await response.json();

				//resultオブジェクトのsuccessプロパティによってメッセージを設定
				if (result.success) {
					this.responseMessage = 'Form submitted successfully!';
					//送信後にフォームをリセット
					this.formData = {
						name: '',
						email: '',
						tel: '',
					};
				} else {
					this.responseMessage = 'Failed to submit form.';
				}
			} catch (error) {//エラーが発生した場合の処理
				console.error('Error:', error);
				this.responseMessage = 'An error occurred.';
			}finally {
				this.isLoading = false;//送信中フラグをfalseに設定
			}
		},
	}
};
</script>
