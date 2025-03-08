<template>
	<div v-if="editUserData" class="update-form">
		<h3>ユーザー情報を編集</h3>
		<div v-if="isShow">

			<!-- 入力フォーム -->
			<ValidatedInput
			id="name"
			v-model="updatedUser.name"
			label="名前:"
			:validation="$v.name"
			:input-ref="nameInput"
			@clear-response-message="clearResponseMessage"
			/>
			<ValidatedInput
			id="email"
			v-model="updatedUser.email"
			label="メールアドレス:"
			:validation="$v.email"
			:input-ref="emailInput"
			@clear-response-message="clearResponseMessage"
			/>
			<ValidatedInput
			id="tel"
			v-model="updatedUser.tel"
			label="tel:"
			:validation="$v.tel"
			:input-ref="telInput"
			@clear-response-message="clearResponseMessage"
			/>
			<!-- 確認ボタン -->
			<button @click="confirmChanges">確認</button>
		</div>


		<!-- 変更前・変更後の比較表示 -->
		<div v-if="isConfirming">
			<h4>変更内容の確認</h4>
			<p><strong>名前:</strong> {{ editUserData.name }} → {{ updatedUser.name }}</p>
			<p><strong>メール:</strong> {{ editUserData.email }} → {{ updatedUser.email }}</p>
			<p><strong>電話:</strong> {{ editUserData.tel }} → {{ updatedUser.tel }}</p>

			<!-- 更新ボタン -->
			<button :disabled="!isConfirming" @click="updateUser">確定</button>
		</div>

		<!-- キャンセルボタン -->
		<button @click="cancelEdit">キャンセル</button>
	</div>
</template>

<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import { useValidation } from '@/composables/useValidation';
import ValidatedInput from "./ValidatedInput.vue";

// 親コンポーネントから受け取るデータ
const props = defineProps({
	editUserData: {
		type: Object,
		default: () => ({}), // ✅ 空オブジェクトをデフォルト値に設定
	},
	apiUrl: {
		type: String,
		default: "", // ✅ 空文字をデフォルト値に設定
	},
	usersCrudUrl: {
		type: String,
		default: "", // ✅ 空文字をデフォルト値に設定
	},
});

const isShow = ref(true);

// 親コンポーネントへイベントを送信
const emit = defineEmits(["update-success", "cancel-edit"]);

// リアクティブな `updatedUser`
const updatedUser = ref({ ...props.editUserData });

// props.editUserData が変更されたら updatedUser に反映
watch(() => props.editUserData, (newData) => {
	updatedUser.value = { ...newData };
});

// バリデーション（useValidation を使用）
const { $v, nameInput, emailInput, telInput, handleValidationErrors } = useValidation(updatedUser.value);

// エラーメッセージ
const responseMessage = ref("");
const isConfirming = ref(false);

// 変更内容を確認
const confirmChanges = async () => {
	$v.value.$touch(); // ✅ バリデーションを適用
	if ($v.value.$invalid) {
		responseMessage.value = 'フォームにエラーがあります。';
		await handleValidationErrors();
		return;
	}
	isConfirming.value = true;
	isShow.value = false;
};

// 更新リクエストを送信
const updateUser = async () => {
	// `updatedUser.value` の `id` をチェック
	if (!updatedUser.value || !updatedUser.value.id) {
		alert("更新できません: ユーザー情報が正しく取得されていません。");
		return;
	}

	$v.value.$touch();
	if ($v.value.$invalid) {
		responseMessage.value = 'フォームにエラーがあります。';
		await handleValidationErrors();
		return;
	}

	try {
		// API に PUT リクエストを送信
		await axios.put(`${props.apiUrl}${props.usersCrudUrl}/${updatedUser.value.id}`, updatedUser.value);
		alert("ユーザー情報が更新されました！");

		// フォームデータをリセット（空データをセット）
		updatedUser.value = { id: "", name: "", email: "", tel: "" };

		// 確認モードをリセット
		isConfirming.value = false;

		// 親コンポーネントへ更新成功を通知
		emit("update-success");
	} catch (error) {
		console.error("更新に失敗しました", error);
		alert("更新に失敗しました");
	}
};


// 編集をキャンセル
const cancelEdit = () => {
	isConfirming.value = false;
	emit("cancel-edit");
};
</script>

<style scoped>
.update-form {
	padding: 20px;
	border: 1px solid #ddd;
	background-color: #f9f9f9;
	margin-top: 10px;
}
</style>
