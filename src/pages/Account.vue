<script setup>
    import { ref, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import {Card, Button, Dialog, Message, InputText, AutoComplete, useToast, useConfirm,
        ConfirmDialog, Toast
    } from 'primevue';
    import {zodResolver} from "@primevue/forms/resolvers/zod";
    import { Form } from '@primevue/forms';
    import {z} from 'zod';

    const route = useRoute();
    const router = useRouter();
    const token = localStorage.getItem("token");
    const account = ref(null);
    const confirm = useConfirm();
    const toast = useToast();
    const showEditAccountForm = ref(false)
    const editAccountInitialValues = ref({name:'', type:'', sharedWith: []})
    const sharedSelected =ref([])
    const userSuggestions = ref([])

    const editAccountResolver = ref(zodResolver(
        z.object({
            name: z.string().min(1, { message: 'Name is required.' }),
            type: z.string().min(1, { message: 'Type is required.' })
        })
    ));
    onMounted(async () => {
        try{
            const accountId = route.params.id;
            const res = await fetch(`http://10.0.0.6:3000/accounts/${accountId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // send token in header
                }
            });
            if (!res.ok) throw new Error('Failed to fetch account');
            account.value = await res.json();
            editAccountInitialValues.value = {
                name: account.value.name,
                type: account.value.type,
                sharedWith: account.value.sharedWith || []
            };
            sharedSelected.value = [...(account.value.sharedWith || [])];
        }catch(err){
            console.error(err);
        }
    });
    const deleteAccount = async () =>{
        const accountId = route.params.id;
        confirm.require({
            message: 'Do you want to delete this account?',
            header: 'Danger Zone',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            rejectProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptProps: {
                    label: 'Delete',
                    severity: 'danger'
            },
            accept: async () => {
                try {
                    const response = await fetch(`http://10.0.0.6:3000/accounts/${accountId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` // send token in header
                        }
                    });
                    if (!response.ok) {
                        const error = await response.text();
                        throw new Error(error || "Failed to delete account");
                    }
                    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Account deleted', life: 3000 });
                    router.push('/');
                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Rejected', detail: 'Failed to delete account', life: 3000 });
                }
            },
            reject: () => {
                toast.add({ severity: 'error', summary: 'Rejected', detail: 'Action canceled', life: 3000 });
            }
        });
    }
    const editAccount = async (e) =>{
        if (e.valid) {
            const accountId = route.params.id;
            toast.add({ severity: 'success', summary: 'Form is submitted.', life: 3000 });
            console.log(e);
            const {name, type} = e.values;
            console.log(sharedSelected.value)
            const sharedWith = sharedSelected.value.map(user => user.id);
            console.log(sharedWith)
            try {
                const response = await fetch(`http://10.0.0.6:3000/accounts/${accountId}`,{
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // send token in header
                },
                body: JSON.stringify({
                    name: name,
                    type: type,
                    sharedWith: sharedWith
                }),
                })
                if (!response.ok){
                throw new Error('Failed to add user')
                }
                account.value = await response.json();
                account.value.sharedWith = sharedSelected.value;
                editAccountInitialValues.value = {
                    name: account.value.name,
                    type: account.value.type,
                    sharedWith: sharedSelected || []
                };
                showEditAccountForm.value =false;
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
</script>
<template>
    <Toast/>
    <ConfirmDialog></ConfirmDialog>
    <div v-if="account && Object.keys(account).length" class="m-5">
        <div class="flex justify-between">
            <div class="content-center">
                <div class="text-sm text-surface-500 mb-1">{{ account.type }}</div>
                <div class="text-lg font-bold text-primary " title="Account name">{{ account.name }}</div>
            </div>
            <div class="flex flex-row content-center items-center">
                <div class="text-3xl font-bold text-green-600 " title="Account balance">{{ account.balance }}</div>
                <div class="flex flex-col ml-2">
                    <Button
                    icon="pi pi-pencil"
                    class="p-button-text p-mr-2 p-button-info"
                    @click="showEditAccountForm=true"
                    title="Edit Account"
                    />

                    <Button
                    icon="pi pi-trash"
                    class="p-button-text p-mr-2 p-button-danger"
                    @click="deleteAccount"
                    title="Delete Account"
                    />
                </div>
            </div>
        </div>
        <div>
            Share with:
            <span v-if="account.sharedWith && account.sharedWith.length">
                {{ account.sharedWith.map(u => u.username).join(', ') }}
            </span>
            <span v-else>
                Nobody
            </span>
        </div>
    </div>
    <Dialog v-model:visible="showEditAccountForm" modal header="Edit Account" :style="{ width: '25rem' }">
        <Form v-slot="$form" :initialValues="editAccountInitialValues" :resolver="editAccountResolver" @submit="editAccount">
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
            <Button type="button" label="Cancel" severity="secondary" @click="showEditAccountForm = false"></Button>
            <Button type="submit" label="Save"></Button>
        </div>
        </Form>
    </Dialog>
</template>
<style scoped></style>