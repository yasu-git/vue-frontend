<script setup>
import { ref, reactive, computed, nextTick } from 'vue';
import { useValidation } from '@/composables/useValidation';
import ValidatedInput from './ValidatedInput.vue';

// 親コンポーネントにユーザーが追加されたことを通知するためのイベントを定義
const emit = defineEmits(['user-added']);

// UI の状態を管理するための `ref`
const responseMessage = ref(''); // フォーム送信結果のメッセージ
const isLoading = ref(false); // API リクエスト中かどうかを管理

/* global process */
const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
const usersCrudUrl = process.env.VUE_APP_USER_CRUD_URL;

// `reactive` を使用してフォームデータを管理
const formData = reactive({
	name: '',
	email: '',
	tel: ''
});

// ボタンの表示メッセージ（送信中は `Loading...` を表示）
const nowLoading = computed(() => (isLoading.value ? 'Loading...' : 'Submit'));

// バリデーション（useValidation を使用）
const { $v, nameInput, emailInput, telInput, handleValidationErrors } = useValidation(formData);

/**
 * **入力時にエラーメッセージをリセット**
 */
function clearResponseMessage() {
	responseMessage.value = ''; // エラーメッセージをクリア
}


/**
 * フォームのリセット処理
 * - フォームデータを初期化
 * - バリデーションのリセット
 * - メッセージのクリア
 */
function resetForm() {
	Object.assign(formData, { name: '', email: '', tel: '' });
	$v.value.$reset();
	responseMessage.value = ''; // メッセージをリセット
}

/**
 * フォーム送信処理
 * - バリデーションチェック
 * - API にデータを送信
 * - 成功時にフォームをリセット & 親コンポーネントに通知
 */
async function submitForm() {
	// バリデーション実行
	$v.value.$touch();
	if ($v.value.$invalid) {
		responseMessage.value = 'フォームにエラーがあります。';
		await handleValidationErrors(); // エラーのある入力欄にフォーカスを当てる
		return;
	}

	isLoading.value = true;
	responseMessage.value = '';

	try {
		// API へフォームデータを送信
		const response = await fetch(`${apiUrl}${usersCrudUrl}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formData),
		});

		console.log('APIリクエスト送信: ', formData); // デバッグ用

		// API からのレスポンスを取得
		const result = await response.json();

		// API エラー時の処理
		if (!response.ok) {
			throw new Error(result.message || 'サーバーエラーが発生しました');
		}

		// 成功時の処理
		responseMessage.value = 'ユーザーが登録されました！';
		console.log('登録成功');

		// 親コンポーネントへユーザー追加のイベントを発火
		emit('user-added');

		// フォームをリセット
		resetForm();
		await nextTick();
		if (nameInput.value) {
			nameInput.value.focus();
		}
	} catch (error) {
		console.error('送信エラー:', error);
		responseMessage.value = 'エラーが発生しました。';
	} finally {
		console.log('APIリクエスト終了');
		isLoading.value = false; // ローディング状態を解除
	}
}
</script>

<template>
	<div class="container">
		<h1>ユーザー登録</h1>
		<form ref="formRef" @submit.prevent="submitForm">
			<!-- 名前の入力欄 -->

			<ValidatedInput
			id="name"
			v-model="formData.name"
			label="名前:"
			:validation="$v.name"
			:input-ref="nameInput"
			@clear-response-message="clearResponseMessage"
			/>

			<ValidatedInput
			id="email"
			v-model="formData.email"
			label="メールアドレス:"
			:validation="$v.email"
			:input-ref="emailInput"
			@clear-response-message="clearResponseMessage"
			/>

			<ValidatedInput
			id="tel"
			v-model="formData.tel"
			label="電話番号:"
			:validation="$v.tel"
			:input-ref="telInput"
			@clear-response-message="clearResponseMessage"
			/>

			<!-- 送信ボタン（ローディング中は無効化） -->
			<button type="submit" :disabled="isLoading">
				{{ nowLoading }}
			</button>
		</form>

		<!-- フォーム送信結果メッセージ -->
		<p v-if="responseMessage">{{ responseMessage }}</p>
	</div>
</template>

<style scoped>
/* エラーメッセージのスタイル */
.error-msg {
	color: red;
	font-size: 14px;
}



/* エラーメッセージ全体のスタイル */
p.error {
	color: red;
	font-weight: bold;
}
</style>
