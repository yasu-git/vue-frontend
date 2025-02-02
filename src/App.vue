<template>
	<div id="app">
		<FormComponent @user-added="handleUserAdded"/>
		<UserListComponent ref="userList"/>
	</div>
</template>

<script>
import FormComponent from './components/FormComponent.vue';
import UserListComponent from './components/UserListComponent.vue';

export default {
	name: 'App',
	components: {
		FormComponent,
		UserListComponent
	},
	methods:{
		// ユーザー追加時の処理
		handleUserAdded(){
			this.$refs.userList.fetchUsers();
		}
	}
};
</script>
