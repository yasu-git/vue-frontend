<template>
	<div id="app">
		<!-- フォームコンポーネント（ユーザーを追加するフォーム） -->
		<FormComponent @user-added="handleUserAdded" />

		<!-- ユーザーリストコンポーネント（ユーザー一覧を表示） -->
		<UserListComponent ref="userListRef" />
	</div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import FormComponent from './components/FormComponent.vue';
import UserListComponent from './components/UserListComponent.vue';

// `UserListComponent` の参照を保持するための ref（Vue 3 の Composition API では this.$refs は使用不可）
const userListRef = ref(null);

/**
 * ユーザーが追加されたときに呼び出される処理
 * - `FormComponent` から `user-added` イベントが発火すると、この関数が実行される
 * - `UserListComponent` の `fetchUsers()` を呼び出して、最新のユーザーリストを取得
 */
async function handleUserAdded() {
	// `userListRef` がセットされるのを待つ
	await nextTick();

	// `UserListComponent` のインスタンスが正しく取得できている場合、`fetchUsers()` を呼び出してユーザーリストを更新
	if (userListRef.value) {
		userListRef.value.fetchUsers();
	} else {
		console.error('❌ userListRef is not available（`UserListComponent` の参照が取得できていません）');
	}
}
</script>
