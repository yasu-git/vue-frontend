<template>
	<div v-if="editUserData" class="update-form">
		<h3>ユーザー情報を編集</h3>
		<div v-if="responseMessage">
			{{ responseMessage }}
		</div>
		<div v-if="!isConfirming">

			<!-- 入力フォーム -->
			<ValidatedInput
			id="name"
			v-model="updatedUser.name"
			label="名前:"
			:validation="$v.name"
			:input-ref="nameInput"
			@clear-response-message="clearResponseMessage(responseMessage)"
			/>
			<ValidatedInput
			id="email"
			v-model="updatedUser.email"
			label="メールアドレス:"
			:validation="$v.email"
			:input-ref="emailInput"
			@clear-response-message="clearResponseMessage(responseMessage)"
			/>
			<ValidatedInput
			id="tel"
			v-model="updatedUser.tel"
			label="tel:"
			:validation="$v.tel"
			:input-ref="telInput"
			@clear-response-message="clearResponseMessage(responseMessage)"
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
import { ref, reactive, watch } from "vue";
import axios from "axios";
import { useValidation } from '@/composables/useValidation';
import ValidatedInput from "./ValidatedInput.vue";
import {useResponseMessage } from "@/composables/useCommon";

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


// 親コンポーネントへイベントを送信
const emit = defineEmits(["update-success", "cancel-edit"]);


// `updatedUser` をリアクティブなオブジェクトにする
const updatedUser = reactive({
	id: "",
	name: "",
	email: "",
	tel: ""
});

// `editUserData` の変更を監視し、`updatedUser` を更新
watch(() => props.editUserData, (newData) => {
	console.log("🚀 更新データを取得:", newData); // 確認用ログ

	if (newData && newData.id) {
		Object.assign(updatedUser,newData);
		console.log("✅ updatedUser にセット:", updatedUser);
	}
}, { immediate: true }); // ✅ 変更がなくても初回実行する


// バリデーション（useValidation を使用）
const { $v, nameInput, emailInput, telInput, handleValidationErrors } = useValidation(updatedUser);

// エラーメッセージ
const {responseMessage, clearResponseMessage, setResponseMessage } = useResponseMessage();

const isConfirming = ref(false);

// 変更内容を確認
const confirmChanges = async () => {
	$v.value.$touch(); // ✅ バリデーションを適用
	if ($v.value.$invalid) {
		setResponseMessage('フォームにエラーがあります。');
		await handleValidationErrors();
		return;
	}

	if (JSON.stringify(props.editUserData) === JSON.stringify(updatedUser)) {
		setResponseMessage("変更がありません。");
		console.log("⚠️ ユーザー情報に変更がありません。");
		return;
	}

	isConfirming.value = true;
};

// 更新リクエストを送信
const updateUser = async () => {
	// `updatedUser.value` の `id` をチェック
	if (!updatedUser || !updatedUser.id) {
		console.log("更新できません :updatedUserにIDがありません",updatedUser);
		alert("更新できません: ユーザー情報が正しく取得されていません。");
		return;
	}

	$v.value.$touch();
	if ($v.value.$invalid) {
		setResponseMessage('フォームにエラーがあります。');
		await handleValidationErrors();
		return;
	}

	try {
		// API に PUT リクエストを送信
		await axios.put(`${props.apiUrl}${props.usersCrudUrl}/${updatedUser.id}`, updatedUser);
		alert("ユーザー情報が更新されました！");

		// フォームデータをリセット（空データをセット）
		// フォームデータをリセット
		updatedUser.id = "";
		updatedUser.name = "";
		updatedUser.email = "";
		updatedUser.tel = "";

		// 確認モードをリセット
		isConfirming.value = false;

		// 親コンポーネントへ更新成功を通知
		emit("update-success");
	} catch (error) {
		isConfirming.value = false;
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
