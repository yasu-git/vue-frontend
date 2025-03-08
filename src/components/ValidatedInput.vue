<template>
	<div :class="{ error: validation.$error }">
		<label :for="id">{{ label }}</label><br />
		<input
		:id="id"
		ref="inputRef"
		:value="modelValue"
		:type="type"
		@blur="validation.$touch()"
		@input="handleInput" /><br />
		<!-- バリデーションエラー表示 -->
		<div v-if="validation.$error">
			<div v-for="error in validation.$errors" :key="error.$uid" class="input-errors">
				<span class="error-msg">{{ error.$message }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

/**
 * ✅ **バリデーション付き入力コンポーネント**
 * - `v-model` で値をバインド
 * - `@clear-response-message` イベントでエラーメッセージをリセット
 *
 * 📌 **使用例:**
 * ```vue
 * <ValidatedInput
 *   id="email"
 *   v-model="formData.email"
 *   label="メールアドレス"
 *   type="email"
 *   :validation="$v.email"
 *   :inputRef="emailInput"
 *   @clear-response-message="clearResponseMessage"
 * />
 * ```
 */

// **Props（親コンポーネントから受け取る）**
defineProps({
	modelValue: {
		type: String,
		default: '', // デフォルトは ``
	}, // 双方向バインディング（`v-model` 用）
	label: {
		type: String,
		default: '', // デフォルトは ``
	}, // 入力項目のラベル
	id: {
		type: String,
		default: '', // デフォルトは ``
	}, // input の `id`
	type: {
		type: String,
		default: 'text', // デフォルトは `text`
	},
	validation: {
    type: Object,
    default: () => ({ $touch: () => {}, $error: false, $errors: [] }), // ✅ デフォルト値を設定
  	}, // Vuelidate のバリデーションオブジェクト
	inputRef: {
		type: Object,
		default: null,
	},
});

// **Emit イベント（親に値を伝える）**
const emit = defineEmits(['update:modelValue', 'clear-response-message']);

// **入力時に親コンポーネントへ変更を通知 & エラーメッセージを消す**
function handleInput(event) {
	emit('update:modelValue', event.target.value);
	emit('clear-response-message'); // エラーメッセージをクリア
}

</script>

<style scoped>
/* エラーメッセージのスタイル */
.error-msg {
	color: red;
	font-size: 14px;
}

</style>
