<script setup>
  import {Card, Button, Dialog, Message, InputText, AutoComplete, useToast} from 'primevue';
  import { ref, onMounted } from 'vue';
  import {zodResolver} from "@primevue/forms/resolvers/zod";
  import { Form } from '@primevue/forms';
  import {z} from 'zod';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  onMounted(async () => {
    try{
      const res = await fetch('http://10.0.0.6:3000/accounts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // send token in header
        }
      });
      if (!res.ok) throw new Error('Failed to fetch accounts');
      accounts.value = await res.json();
    }catch(err){
      console.error(err);
    }
  });
  const token = localStorage.getItem('token');
  const toast = useToast();
  const accounts = ref([])
  const sharedSelected =ref([])
  const showAccountForm = ref(false)
  const addAccountInitialValues = ref({name:'', type:'', initialAmount:'', sharedWith: []})
  const userSuggestions = ref([])
  const addAccountResolver = ref(zodResolver(
    z.object({
        name: z.string().min(1, { message: 'Name is required.' }),
        type: z.string().min(1, { message: 'Type is required.' }),
        initialAmount: z
        .string()
        .min(1, { message: 'Initial amount is required.' })
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val >= 0, {
          message: 'Initial amount must be a valid non-negative number.',
        }),
    })
  ));
  const addAccount = async (e) => {
    if (e.valid) {
      toast.add({ severity: 'success', summary: 'Form is submitted.', life: 3000 });
      console.log(e);
      const {name, type, initialAmount} = e.values;
      console.log(sharedSelected.value)
      const sharedWith = sharedSelected.value.map(user => user.id);
      console.log(sharedWith)
      try {
        const response = await fetch('http://10.0.0.6:3000/accounts',{
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // send token in header
          },
          body: JSON.stringify({
            name: name,
            type: type,
            balance: initialAmount,
            sharedWith: sharedWith
          }),
        })
        if (!response.ok){
          throw new Error('Failed to add user')
        }
        const newAccount = await response.json();
        accounts.value.push(newAccount);
        showAccountForm.value =false;
      } catch (err) {
        console.error(err)
      }
    }
  }
  const searchUsers = async (event) => {
    const query = event.query.trim()
    if (!query) {
      userSuggestions.value = []
      return
    }

    try {
      // example: fetch users from your backend
      const res = await fetch(`http://10.0.0.6:3000/users/search?search=${encodeURIComponent(query)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
      });
      const data = await res.json()
      // assume API returns: [{ id: 2, username: "Tony" }, { id: 3, username: "Mark" }]
      userSuggestions.value = data
    } catch (err) {
      console.error('Error fetching users:', err)
      userSuggestions.value = []
    }
  }
  const goToAccount = (account) =>{
    router.push(`/account/${account.id}`);
  }
</script>

<template>
  <div class="m-10">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-primary">Accounts</h2>
      <Button icon="pi pi-plus" class="p-button-text p-mr-2" @click="showAccountForm=true" />
  </div>
    <Card v-for="account in accounts" :key="account.id" class="mb-2" @click="goToAccount(account)">
      <template #content>
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <div class="text-sm text-surface-500 mb-1">{{ account.type }}</div>
            <div class="text-lg text-primary " title="Account name">{{ account.name }}</div>
          </div>
          <div class="text-right">
            <div class="text-lg text-primary">{{ account.balance }}</div>
          </div>
        </div>
      </template>
      
    </Card>
  </div>

  <Dialog v-model:visible="showAccountForm" modal header="Add Account" :style="{ width: '25rem' }">
    <Form v-slot="$form" :initialValues="addAccountInitialValues" :resolver="addAccountResolver" @submit="addAccount">
      <div class="flex items-center gap-4 mb-4">
        <label for="name" class="font-semibold w-24">Name</label>
        <InputText name="name" class="flex-auto" autocomplete="off" />
      </div>
      <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple" class="mb-4 ml-30">{{ $form.name.error.message }}</Message>
      <div class="flex items-center gap-4 mb-4">
        <label for="type" class="font-semibold w-24">Type</label>
        <InputText name="type" class="flex-auto" autocomplete="off" />
      </div>
      <Message v-if="$form.type?.invalid" severity="error" size="small" variant="simple" class="mb-4 ml-30">{{ $form.type.error.message }}</Message>
      <div class="flex items-center gap-4 mb-4">
        <label for="initialAmount" class="font-semibold w-24">Amount</label>
        <InputText 
          name="initialAmount" 
          type="number" 
          class="flex-auto" 
          autocomplete="off"
          placeholder="0.00"
        />
      </div>
      <Message v-if="$form.initialAmount?.invalid" severity="error" size="small" variant="simple" class="mb-4 ml-30">{{ $form.initialAmount.error.message }}</Message>
      <div class="flex items-center gap-4 mb-4">
        <label for="sharedWith" class="font-semibold w-24">Share With</label>
        <AutoComplete
          v-model="sharedSelected"
          name="sharedWith"
          optionLabel="username"
          multiple
          class="flex-auto"
          :suggestions="userSuggestions"
          @complete="searchUsers"
          placeholder="Search users..."
        />
      </div>
      <div class="flex justify-end gap-2">
          <Button type="button" label="Cancel" severity="secondary" @click="showAccountForm = false"></Button>
          <Button type="submit" label="Save"></Button>
      </div>
    </Form>
  </Dialog>
</template>

<style scoped></style>