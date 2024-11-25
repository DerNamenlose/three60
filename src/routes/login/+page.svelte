<h1 class="text-3xl">Login</h1>
<div>
	<form class="grid grid-cols-2 gap-1" method="POST">
		<label for="name" class="justify-self-end">Email address</label>
		<input type="email" name="email" id="email" class="justify-self-start" required />
		<label for="password" class="justify-self-end">Password</label>
		<input type="password" name="password" id="password" class="justify-self-start" required />
		<button type="submit" class="col-span-2 w-40 justify-self-center bg-slate-200">Log In</button>
	</form>
</div>
