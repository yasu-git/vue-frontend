<script setup>
//defineEmitsを追加 (emitを使うため)
/* global defineEmits */

import { reactive, ref, computed } from 'vue';
//validationを追加
import { required, email, numeric, minLength, helpers } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';

//イベントを親コンポーネントへ発火するために、emitを追加
const emit = defineEmits(['user-added']);

//フォームデータを定義(reactiveで管理)
const formData = reactive({
	name: '',
	email: '',
	tel: '',
});

//メッセージや送信中フラグを定義(refで管理)
const responseMessage = ref('');
const isLoading = ref(false);

//サーバーサイドのエンドポイントを定義
const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';

/*
バリデーションルールを定義
required: 必須
email: メールアドレス形式
numeric: 数字のみ
minLength: 最小文字数
バリデーションを使用しているところと同じ表記にする必要がある
v$.name.$errorのように使用するときは、v$の後にバリデーション名を記述する
v$.formDate.name.$errorのように使用するときは、v$の後にバリデーション名を記述する
formDate{
	name: { required },
	email: { required, email },
	tel: { required, minLength: minLength(10), numeric },
}	と記述する
*/
const rules = {
	name: {
		/*
		helpers.withMessageでエラーメッセージをカスタマイズ
		エラーメッセージをカスタマイズする場合は、エラーメッセージを第二引数に追加する
		必要なければ、requiredのみ記述する
		*/
		required: helpers.withMessage('名前は必須です.', required),
	},
	email: {
		required: helpers.withMessage('emailは必須です.', required),
		email: helpers.withMessage('正しいメールアドレスを入力してください。.', email),
	},
	tel: {
		required: helpers.withMessage('電話番号は必須です.', required),
		minLength: helpers.withMessage('電話番号は１０桁以上で入力してください。', minLength(10)),
		numeric: helpers.withMessage('数字のみ入力してください.', numeric),
	},
};


//useVuelidateでバリデーション状態を管理
const v$ = useVuelidate(rules, formData);

//buttonの表示用のcomputedを定義
const nowLoading = computed(() => isLoading.value ? 'Loading...' : 'Submit');

//フォーム送信処理
async function submitForm() {

	//バリデーションチェック
	v$.value.$touch();

	if (v$.value.$error) {
		responseMessage.value = 'Please check the form.';
		return;
	}
	//バリデーションチェック終わり


	console.log("Sending data:", JSON.parse(JSON.stringify(formData)));
	isLoading.value = true;
	responseMessage.value = '';

	try {
		const response = await fetch(`${apiUrl}/api/form`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Server Error');
		}

		const result = await response.json();

		if (result.success) {
			responseMessage.value = 'Form submitted successfully!';
			emit('user-added');
			formData.name = '';
			formData.email = '';
			formData.tel = '';
			v$.value.$reset();
		} else {
			responseMessage.value = 'Failed to submit form.';
		}
	} catch (error) {
		console.error('Error:', error);
		responseMessage.value = 'An error occurred.';
	} finally {
		isLoading.value = false;
	}
}
</script>

<template>
	<div class="container">
		<h1>Form Submission</h1>
		<form @submit.prevent="submitForm">
			<!-- name, email, tellの入力フォーム -->
			<!-- name -->
			<div :class="{ error: v$.name.$errors.length }">
				<label for="name">Name:</label><br />
				<input type="text" id="name" v-model="formData.name" /><br />
				<!-- バリデーションエラー表示 -->
				<div v-if="v$.name.$error">
					<div class="input=errors" v-for="error in v$.name.$errors" :key="error.$uid">
						<span class="error-msg">{{ error.$message }}</span>
					</div>
				</div>

			</div>

			<!-- email -->
			<div :class="{ error: v$.email.$errors.length }">
				<label for="email">Email:</label><br />
				<input type="email" id="email" v-model.trim="formData.email" /><br />
				<!-- バリデーションエラー表示 -->
				<div v-if="v$.email.$error">
					<div class="input=errors" v-for="error in v$.email.$errors" :key="error.$uid">
						<span class="error-msg">{{ error.$message }}</span>
					</div>
				</div>

			</div>

			<!-- tell -->
			<div :class="{ error: v$.tel.$errors.length }">
				<label for="tel">tel:</label><br />
				<input type="tel" id="tel" v-model.trim="formData.tel" /><br />
				<!-- バリデーションエラー表示 -->
				<div v-if="v$.tel.$error">
					<div class="input=errors" v-for="error in v$.tel.$errors" :key="error.$uid">
						<span class="error-msg">{{ error.$message }}</span>
					</div>
				</div>

			</div>

			<!-- 送信中は押せないようにする-->
			<button type="submit" :disabled="isLoading">
				{{ nowLoading }}
			</button>
		</form>
		<p v-if="responseMessage">{{ responseMessage }}</p>
	</div>
</template>