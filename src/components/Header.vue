<script setup>
    import Button from 'primevue/button';
    import Menu from 'primevue/menu';
    import { ref } from "vue";

    const menu = ref();
    const items = ref([
        {
            label: 'Menu',
            items: [
                {
                    label: 'Refresh',
                    icon: 'pi pi-refresh'
                },
                {
                    label: 'Export',
                    icon: 'pi pi-upload'
                }
            ]
        }
    ]);

    const toggle = (event) => {
        menu.value.toggle(event);
    };
</script>

<template>
  <header class="tracker-header flex justify-between">
    <!-- Left: Hamburger + Logo -->
    <div class="p-d-flex p-ai-center">
      <Button icon="pi pi-bars" class="p-button-text p-mr-3" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" />
      <Menu ref="menu" id="overlay_menu" :model="items" :popup="true"  />
      
      <!-- img src="@/assets/logo.png" alt="Logo" class="logo p-mr-2" /> -->
      <span class="app-name">Expenses Tracker</span>
    </div>

    <!-- Right: Action icons -->
    <div class="">
      <Button icon="pi pi-sun" class="p-button-text p-mr-2" @click="toggleTheme" />
      <Button icon="pi pi-user" class="p-button-text p-mr-2" @click="$emit('open-profile')" />
      <Button icon="pi pi-ellipsis-v" class="p-button-text" @click="$emit('open-menu')" />
    </div>
  </header>
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
    .tracker-header {
      background-color: #fff;
      border-bottom: 1px solid #e0e0e0;
      height: 60px;
    }

    .logo {
      width: 32px;
      height: 32px;
    }

    .app-name {
      font-weight: 600;
      font-size: 1.2rem;
    }
</style>