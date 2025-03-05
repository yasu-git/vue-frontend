import { ref, nextTick } from 'vue';
import { required, email, numeric, minLength, helpers } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';

/**
 * バリデーション & フォーカス管理用 composable
 *
 * この関数は Vue 3 の Composition API でフォームのバリデーションとエラー時のフォーカス管理を行う。
 *
 * @param {Object} formData - バリデーション対象のデータ（ユーザー入力）
 * @returns {Object} バリデーションの状態 (`$v`)、入力フィールドの ref、エラーハンドリング関数
 */
export function useValidation(formData) {
	// 各入力フィールドの ref（バリデーションエラー時にフォーカスを当てるために使用）
	const nameInput = ref(null);
	const emailInput = ref(null);
	const telInput = ref(null);

	// バリデーションルールの定義（Vuelidate を使用）
	const rules = {
		name: {
			required: helpers.withMessage('名前は必須です.', required) // 必須入力
		},
		email: {
			required: helpers.withMessage('emailは必須です.', required), // 必須入力
			email: helpers.withMessage('正しいメールアドレスを入力してください。', email), // メールアドレス形式のチェック
		},
		tel: {
			required: helpers.withMessage('電話番号は必須です.', required), // 必須入力
			minLength: helpers.withMessage('電話番号は10桁以上で入力してください。', minLength(10)), // 最低10桁必要
			numeric: helpers.withMessage('数字のみ入力してください.', numeric), // 数値のみ許可
		},
	};

	// useVuelidate を適用し、バリデーション管理オブジェクト `$v` を作成
	const $v = useVuelidate(rules, formData);

	/**
	 * バリデーションエラー時に適切な入力フィールドにフォーカスを当てる
	 *
	 * - `$v.value.name.$error` が `true` の場合は `nameInput` にフォーカス
	 * - `$v.value.email.$error` が `true` の場合は `emailInput` にフォーカス
	 * - `$v.value.tel.$error` が `true` の場合は `telInput` にフォーカス
	 */
	async function handleValidationErrors() {
		await nextTick(); // UI が更新されてから処理を実行

		if ($v.value.name.$error && nameInput.value) {
			nameInput.value.focus(); // `name` のエラーがある場合、フォーカスを当てる
		} else if ($v.value.email.$error && emailInput.value) {
			emailInput.value.focus(); // `email` のエラーがある場合、フォーカスを当てる
		} else if ($v.value.tel.$error && telInput.value) {
			telInput.value.focus(); // `tel` のエラーがある場合、フォーカスを当てる
		}
	}

	// バリデーションオブジェクト、入力フィールド ref、エラーハンドリング関数を返す
	return {
		$v, // バリデーションの状態
		nameInput, // 名前入力フィールドの ref
		emailInput, // メール入力フィールドの ref
		telInput, // 電話番号入力フィールドの ref
		handleValidationErrors, // バリデーションエラー時のフォーカス処理関数
	};
}
