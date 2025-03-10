<script setup>
import { reactive, nextTick } from 'vue';
import { useValidation } from '@/composables/useValidation';
import ValidatedInput from './ValidatedInput.vue';
import { fetchAPI} from '@/composables/useApi';
import { useLoading, useResponseMessage , apiUrl, usersCrudUrl} from "@/composables/useCommon";

// `reactive` を使用してフォームデータを管理
const formData = reactive({
	name: '',
	email: '',
	tel: ''
});


// 親コンポーネントにユーザーが追加されたことを通知するためのイベントを定義
const emit = defineEmits(['user-added']);

//ローディング状態の管理
const { isLoading, nowLoading, startLoading, stopLoading } = useLoading();

// エラーメッセージ管理
const { responseMessage, clearResponseMessage, setResponseMessage } = useResponseMessage();

// バリデーション（useValidation を使用）
const { $v, nameInput, emailInput, telInput, handleValidationErrors } = useValidation(formData);

/**
 * フォームのリセット処理
 * - フォームデータを初期化
 * - バリデーションのリセット
 * - メッセージのクリア
 */
function resetForm() {
	Object.assign(formData, { name: '', email: '', tel: '' });
	$v.value.$reset();
	setResponseMessage(''); // メッセージをリセット
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
		setResponseMessage('フォームにエラーがあります。');
		await handleValidationErrors(); // エラーのある入力欄にフォーカスを当てる
		return;
	}

	startLoading();
	clearResponseMessage();

	try {
		// API へフォームデータを送信
		await fetchAPI(`${apiUrl}${usersCrudUrl}`, 'POST', formData);

		// 成功時の処理
		setResponseMessage('ユーザーが登録されました！');
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
		setResponseMessage('エラーが発生しました。');
	} finally {
		console.log('APIリクエスト終了');
		stopLoading();
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
