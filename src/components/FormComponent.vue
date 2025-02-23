<script setup>
//defineEmitsを追加 (emitを使うため)
/* global defineEmits */

import { reactive, ref, computed ,nextTick} from 'vue';
//validationを追加
import { required, email, numeric, minLength, helpers } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';
import { useTemplateRef } from 'vue';

//イベントを親コンポーネントへ発火するために、emitを追加
const emit = defineEmits(['user-added']);

//メッセージや送信中フラグを定義(refで管理)
const responseMessage = ref('');
const isLoading = ref(false);

//サーバーサイドのエンドポイントを定義
/* global process */
const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
const usersCrudUrl = process.env.VUE_APP_USER_CRUD_URL;

// ** `useTemplateRef` を使ってフォームの各要素を取得**/
const nameInput = useTemplateRef();
const emailInput = useTemplateRef();
const telInput = useTemplateRef();

// ** `useTemplateRef` を使ってフォーム全体を取得**/
const formRef = useTemplateRef();

//buttonの表示用のcomputedを定義
const nowLoading = computed(() => (isLoading.value ? 'Loading...' : 'Submit'));


//ここからバリデーションの記述

//フォームデータを定義(reactiveで管理)
const formData = reactive({
	name: '',
	email: '',
	tel: '',
});

/**
 *  バリデーションルールを定義
 * - `required`: 必須
 * - `email`: メールアドレス形式
 * - `numeric`: 数字のみ
 * - `minLength`: 最小文字数
 */
const rules = {
	//nameのバリデーション
	name: {
		/*
		helpers.withMessageでエラーメッセージをカスタマイズ
		エラーメッセージをカスタマイズする場合は、エラーメッセージを第二引数に追加する
		必要なければ、requiredのみ記述する
		*/
		required: helpers.withMessage('名前は必須です.', required),
	},
	//emailのバリデーション
	email: {
		required: helpers.withMessage('emailは必須です.', required),
		email: helpers.withMessage('正しいメールアドレスを入力してください。.', email),
	},
	//tellのバリデーション
	tel: {
		required: helpers.withMessage('電話番号は必須です.', required),
		minLength: helpers.withMessage('電話番号は１０桁以上で入力してください。', minLength(10)),
		numeric: helpers.withMessage('数字のみ入力してください.', numeric),
	},
};

//useVuelidate を使用し、バリデーション状態を管理
const $v = useVuelidate(rules, formData);

// **🎯 バリデーションエラー時、最初のエラーに `focus()` を適用**/
async function handleValidationErrors() {
	await nextTick(); // UI 更新後に処理を実行
	if ($v.value.name.$error && nameInput.value) {
    	nameInput.value.focus();
	} else if ($v.value.email.$error && emailInput.value) {
		emailInput.value.focus();
	} else if ($v.value.tel.$error && telInput.value) {
		telInput.value.focus();
	}
}

/**
 *  フォーム送信処理
 * - バリデーションチェック
 * - API にデータを送信
 * - 成功時にフォームをリセット & 親コンポーネントに通知
 */
async function submitForm() {

	//バリデーションを実行
	$v.value.$touch();

	//バリデーションエラーがある場合、処理を中断
	if ($v.value.$invalid) {
		//エラーがあればメッセージを表示
		responseMessage.value = 'Please check the form.';
		handleValidationErrors();
		return;
	}
	//バリデーションチェック終わり

	//フォームデータをログに出力（デバッグ用）
	console.log("Sending data:", JSON.parse(JSON.stringify(formData)));

	//ローディングを開始
	isLoading.value = true;
	//レスポンスメッセージをリセット
	responseMessage.value = '';

	try {

		//API にフォームデータを送信（POST）
		const response = await fetch(`${apiUrl}${usersCrudUrl}`, {
			//POSTリクエスト
			method: 'POST',
			//ヘッダーをJSON形式で送信
			headers: {
				'Content-Type': 'application/json',
			},
			//フォームデータをJSON形式で送信
			body: JSON.stringify(formData),
		});

		// API からエラーが返された場合
		if (!response.ok) {

			const errorData = await response.json();
			throw new Error(errorData.message || 'Server Error');

		}

		//成功時のレスポンスを取得
		const result = await response.json();

		//成功したらフォームをリセット
		if (result.success) {

			//成功メッセージを表示
			responseMessage.value = 'Form submitted successfully!';
			//親コンポーネントへイベントを発火
			emit('user-added');
			//フォームをリセット
			Object.assign(formData, { name: '', email: '', tel: '' });
			//バリデーションエラーをリセット
			$v.value.$reset();

			// **🎯 `formRef` を使用してフォームをリセット**
			if (formRef.value) {
        		formRef.value.reset(); // ここで `formRef` を活用
			}

			await nextTick();
			nameInput.value.focus();

		} else {

			//失敗メッセージを表示
			responseMessage.value = 'Failed to submit form.';

		}
	} catch (error) {

		//エラーメッセージを表示
		console.error('Error:', error);
		//エラーメッセージを表示
		responseMessage.value = 'An error occurred.';

	} finally {

		//ローディングを終了
		isLoading.value = false;
	}
}
</script>

<template>
	<div class="container">
		<h1>Form Submission</h1>
		<form ref="formRef" @submit.prevent="submitForm">
			<!-- name, email, tellの入力フォーム -->
			<!-- name -->
			<div :class="{ error: $v.name.$error }">
				<label for="name">Name:</label><br />
				<!-- 各入力欄でユーザがフォーカスを話したタイミングで個別に$touch()を呼び出し、入力後すぐエラーを表示を反映させる。 -->
				<input
				id="name"
				ref="nameInput"
				v-model="formData.name"
				type="text"
				@blur="$v.name.$touch()"
				/><br />
				<!-- バリデーションエラー表示 -->
				<div v-if="$v.name.$error">
					<div v-for="error in $v.name.$errors" :key="error.$uid" class="input-errors">
						<span class="error-msg">{{ error.$message }}</span>
					</div>
				</div>

			</div>

			<!-- email -->
			<div :class="{ error: $v.email.$error }">
				<label for="email">Email:</label><br />
				<input
				id="email"
				ref="emailInput"
				v-model.trim="formData.email"
				type="email"
				@blur="$v.email.$touch()"
				/><br />
				<!-- バリデーションエラー表示 -->
				<div v-if="$v.email.$error">
					<div v-for="error in $v.email.$errors" :key="error.$uid" class="input-errors">
						<span class="error-msg">{{ error.$message }}</span>
					</div>
				</div>

			</div>

			<!-- tell -->
			<div :class="{ error: $v.tel.$error }">
				<label for="tel">tel:</label><br />
				<input
				id="tel"
				ref="telInput"
				v-model.trim="formData.tel"
				type="tel"
				@blur="$v.tel.$touch()"
				/><br />
				<!-- バリデーションエラー表示 -->
				<div v-if="$v.tel.$error">
					<div v-for="error in $v.tel.$errors" :key="error.$uid" class="input-errors">
						<span class="error-msg">{{ error.$message }}</span>
					</div>
				</div>

			</div>

			<!--送信ボタン（ローディング中は無効化-->
			<button type="submit" :disabled="isLoading">
				{{ nowLoading }}
			</button>
		</form>

		<!-- フォーム送信結果メッセージ -->
		<p v-if="responseMessage">{{ responseMessage }}</p>
	</div>
</template>