<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <a class="navbar-brand" href="#"><router-link class="nav-link" to="/">ToDo List</router-link></a>
      <list class="navbar-nav">
        <li class="nav-item">
          <router-link class="nav-link" to="/">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/details">Task Details</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/add">Add Task</router-link>
        </li>
      </list>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
</script>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
}
</style>
