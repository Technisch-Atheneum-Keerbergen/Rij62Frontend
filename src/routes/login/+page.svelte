<script>
	function loginWithGoogle() {
		window.location.href = 'https://localhost:5173/auth/login';
	}
</script>

<h1>Login</h1>

<button on:click={loginWithGoogle}> Login with Google </button>
