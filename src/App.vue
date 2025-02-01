<template>
	<div id="app">
		<FormComponent />
		<UserListComponent />
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
	}
};
</script>
