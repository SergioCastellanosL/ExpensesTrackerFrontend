<script>
    export default {
    name: 'Header'
    };
</script>

<template>
  <header class="app-header">
    <h1>Expense Tracker</h1>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/users">Users</router-link>
    </nav>
  </header>
</template>

<style>
    .app-header {
    background-color: #f4f4f4;
    padding: 1rem;
    border-bottom: 1px solid #ccc;
    }
    nav a {
    margin-right: 1rem;
    text-decoration: none;
    color: #333;
    }
    nav a.router-link-active {
    font-weight: bold;
    }
</style>