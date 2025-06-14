<template>
    <div>
       
    </div>
</template>

<script>
export default {
    name: "sellerPage",  
    data() {
        return {
            businessId: null,
        }
    },
    methods: {
        
    },
    mounted() {
        
    },
    created(){
        this.businessId= this.$route.query.businessId;
    }
}
</script>

<style scoped>

</style>