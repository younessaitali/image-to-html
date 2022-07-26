<script setup lang='ts' >
useHead({
    title: 'Image to HTML'
})
</script>

<template>

    <main class="flex justify-center items-center flex-col">
        <h1>Choose an image file </h1>
        <input type="file" accept=".jpeg,.jpg,.png,image/jpeg,image/png" aria-label="upload image button" @change="">
    </main>
</template>
