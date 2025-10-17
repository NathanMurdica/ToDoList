<template>
  <div id="app">
    <!-- Optional: Navbar or header -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <a class="navbar-brand" href="#">ToDo List</a>
    </nav>

    <!-- The router will render your component here -->
    <router-view />
  </div>
</template>

<script setup>
// No script logic needed yet
</script>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
}
</style>
