<script setup lang='ts' >


useHead({
    title: 'Image to HTML'
})

const output = ref('')
const onChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file: File | undefined = target.files?.[0]

    if (!file)
        return

    const formData = new FormData()
    formData.append('file', file)

    const data = await $fetch('/api/image-to-text', {
        method: 'POST',
        body: formData,
    })

    output.value = data
}
</script>

<template>
    <main class="flex justify-center items-center flex-col ">
        <h1>Choose an image file </h1>
        <input type="file" accept=".jpeg,.jpg,.png,image/jpeg,image/png" aria-label="upload image button"
            @change="onChange">
        <div class="p-32 mt-16 border border-gray bg-gray-500  text-center text-[3px]" v-html="output" />

    </main>
</template>
